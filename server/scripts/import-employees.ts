import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { clientEmployees, clients, costCenters } from '../../shared/schema';
import { createSeniorIntegrationService } from '../services/seniorIntegration';
import { eq, and, ilike } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;
const SENIOR_API_URL = process.env.SENIOR_API_URL;
const SENIOR_API_KEY = process.env.SENIOR_API_KEY;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL não está configurado');
}

if (!SENIOR_API_URL || !SENIOR_API_KEY) {
  throw new Error('SENIOR_API_URL ou SENIOR_API_KEY não estão configurados');
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

interface SeniorEmployee {
  numcad: number;      // Número cadastral (matrícula)
  nomfun: string;      // Nome do funcionário (da tabela r034fun)
  sitafa: number;      // Situação (7=Ativo, 4=Desligado, etc)
  datadm: string;      // Data de admissão
  datafa: string | null; // Data de afastamento/demissão
  codcar: string;      // Código do cargo
  titcar: string;      // Título do cargo (via JOIN com r024car)
  nomccu: string;      // Nome do centro de custo (via JOIN com r018ccu)
  codccu: string;      // Código do centro de custo
}

async function importEmployees() {
  console.log('🚀 Iniciando importação de funcionários da Senior...\n');

  try {
    // Criar serviço de integração com Senior
    const seniorService = createSeniorIntegrationService({
      apiUrl: SENIOR_API_URL!,
      apiKey: SENIOR_API_KEY!,
    });

    // Buscar cliente Localiza
    const localizaClients = await db
      .select()
      .from(clients)
      .where(ilike(clients.name, '%localiza%'))
      .limit(1);

    if (localizaClients.length === 0) {
      console.error('❌ Cliente Localiza não encontrado no banco de dados');
      console.log('💡 Execute a sincronização de clientes primeiro ou crie manualmente');
      return;
    }

    const localizaClient = localizaClients[0];
    console.log(`✅ Cliente encontrado: ${localizaClient.name} (ID: ${localizaClient.id})\n`);

    // Buscar centros de custo da Localiza no banco local
    const localizaCostCenters = await db
      .select()
      .from(costCenters)
      .where(ilike(costCenters.name, '%localiza%'));

    console.log(`📊 ${localizaCostCenters.length} centros de custo Localiza encontrados\n`);

    if (localizaCostCenters.length === 0) {
      console.error('❌ Nenhum centro de custo Localiza encontrado');
      return;
    }

    // Construir query para buscar funcionários da tabela r034fun (funcionários com vínculo)
    // Filtrando apenas os que estão em centros de custo com "localiza"
    const costCenterCodes = localizaCostCenters.map(cc => cc.code);
    const costCenterCodesStr = costCenterCodes.map(code => `'${code}'`).join(',');

    const query = `
      SELECT 
        f.numcad,
        f.nomfun,
        f.sitafa,
        f.datadm,
        f.datafa,
        f.codcar,
        c.titcar,
        cc.nomccu,
        f.codccu
      FROM r034fun f
      LEFT JOIN r024car c ON f.codcar = c.codcar AND f.estcar = c.estcar
      LEFT JOIN r018ccu cc ON f.codccu = cc.codccu
      WHERE f.codccu IN (${costCenterCodesStr})
      ORDER BY f.nomfun
    `;

    console.log('📡 Buscando funcionários da tabela r034fun...');
    const seniorEmployees = await seniorService.executeQuery<SeniorEmployee>(query);
    
    console.log(`📥 ${seniorEmployees.length} funcionários encontrados na Senior\n`);

    if (seniorEmployees.length === 0) {
      console.log('⚠️ Nenhum funcionário encontrado nos centros de custo Localiza');
      return;
    }

    let imported = 0;
    let updated = 0;
    let errors = 0;
    let skipped = 0;

    // Processar em lotes menores para evitar timeout
    const BATCH_SIZE = 50;
    const totalBatches = Math.ceil(seniorEmployees.length / BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, seniorEmployees.length);
      const batch = seniorEmployees.slice(start, end);

      console.log(`\n📦 Processando lote ${batchIndex + 1}/${totalBatches} (${start + 1}-${end} de ${seniorEmployees.length})...\n`);

      for (const employee of batch) {
        try {
          // Encontrar o centro de custo correspondente no banco local
          const costCenter = localizaCostCenters.find(
            cc => cc.code === employee.codccu
          );

          if (!costCenter) {
            skipped++;
            continue;
          }

          // Mapear situação do funcionário
          // Senior sitafa: 1=Normal/Ativo, 4=Desligado, 5=Férias, 7=Ativo, 8=Afastado, 9=Aviso Prévio
          let status: 'ativo' | 'desligado' | 'ferias' | 'afastamento' = 'ativo';
          
          // Verificar se datafa é uma data real (não 1900-12-31 que é placeholder)
          const hasRealTerminationDate = employee.datafa && 
            new Date(employee.datafa).getFullYear() > 1900;
          
          if (employee.sitafa === 4 || hasRealTerminationDate) {
            status = 'desligado';
          } else if (employee.sitafa === 5) {
            status = 'ferias';
          } else if (employee.sitafa === 8 || employee.sitafa === 9) {
            status = 'afastamento';
          } else if (employee.sitafa === 1 || employee.sitafa === 7) {
            status = 'ativo';
          }

          const employeeData = {
            clientId: localizaClient.id,
            costCenterId: costCenter.id,
            name: employee.nomfun,
            position: employee.titcar || null,
            status,
            admissionDate: employee.datadm ? new Date(employee.datadm) : null,
            terminationDate: employee.datafa ? new Date(employee.datafa) : null,
            notes: `Matrícula: ${employee.numcad} | Cargo: ${employee.codcar || 'N/A'}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Inserir diretamente (permitir duplicatas serem tratadas pela constraint unique)
          try {
            await db
              .insert(clientEmployees)
              .values(employeeData);
            
            imported++;
            if (imported % 10 === 0) {
              console.log(`✅ ${imported} funcionários importados...`);
            }
          } catch (insertError: any) {
            // Se erro de duplicata, ignorar silenciosamente
            if (insertError.message?.includes('duplicate') || insertError.message?.includes('unique')) {
              skipped++;
            } else {
              throw insertError;
            }
          }
        } catch (error) {
          console.error(`❌ Erro ao importar ${employee.nomfun}:`, error instanceof Error ? error.message : error);
          errors++;
        }
      }

      // Pequeno delay entre lotes
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n═══════════════════════════════════════');
    console.log('📊 RESUMO DA IMPORTAÇÃO');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Novos funcionários importados: ${imported}`);
    console.log(`⏭️  Funcionários ignorados (duplicados/sem CC): ${skipped}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📋 Total processado: ${seniorEmployees.length}`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erro durante importação:', error);
    throw error;
  }
}

// Executar importação
importEmployees()
  .then(() => {
    console.log('✨ Importação concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na importação:', error);
    process.exit(1);
  });
