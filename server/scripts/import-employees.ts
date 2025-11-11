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
  numcad: string;      // Número cadastral (matrícula)
  nomfun: string;      // Nome do funcionário
  sitafa: string;      // Situação (A=Ativo, D=Desligado, etc)
  datadm: string;      // Data de admissão
  datdem: string | null; // Data de demissão
  codcar: string;      // Código do cargo
  titcar: string;      // Título do cargo
  nomccu: string;      // Nome do centro de custo
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

    // Construir query para buscar funcionários da tabela r033pes
    // Filtrando apenas os que estão em centros de custo com "localiza"
    const costCenterCodes = localizaCostCenters.map(cc => cc.code);
    const costCenterCodesStr = costCenterCodes.map(code => `'${code}'`).join(',');

    const query = `
      SELECT 
        p.numcad,
        p.nomfun,
        p.sitafa,
        p.datadm,
        p.datdem,
        c.codcar,
        c.titcar,
        cc.nomccu,
        cc.codccu
      FROM r033pes p
      LEFT JOIN r024car c ON p.codcar = c.codcar
      LEFT JOIN r018ccu cc ON p.codccu = cc.codccu
      WHERE cc.codccu IN (${costCenterCodesStr})
      ORDER BY p.nomfun
    `;

    console.log('📡 Buscando funcionários da tabela r033pes...');
    const seniorEmployees = await seniorService.executeQuery<SeniorEmployee>(query);
    
    console.log(`📥 ${seniorEmployees.length} funcionários encontrados na Senior\n`);

    if (seniorEmployees.length === 0) {
      console.log('⚠️ Nenhum funcionário encontrado nos centros de custo Localiza');
      return;
    }

    let imported = 0;
    let updated = 0;
    let errors = 0;

    // Importar cada funcionário
    for (const employee of seniorEmployees) {
      try {
        // Encontrar o centro de custo correspondente no banco local
        const costCenter = localizaCostCenters.find(
          cc => cc.code === employee.codccu
        );

        if (!costCenter) {
          console.warn(`⚠️ Centro de custo ${employee.codccu} não encontrado localmente`);
          errors++;
          continue;
        }

        // Mapear situação do funcionário
        let status: 'ativo' | 'desligado' | 'ferias' | 'afastamento' = 'ativo';
        if (employee.sitafa === 'D' || employee.datdem) {
          status = 'desligado';
        } else if (employee.sitafa === 'F') {
          status = 'ferias';
        } else if (employee.sitafa === 'L' || employee.sitafa === 'A') {
          status = 'afastamento';
        }

        // Verificar se já existe (pelo nome e cliente)
        const existing = await db
          .select()
          .from(clientEmployees)
          .where(
            and(
              eq(clientEmployees.clientId, localizaClient.id),
              eq(clientEmployees.name, employee.nomfun)
            )
          )
          .limit(1);

        const employeeData = {
          clientId: localizaClient.id,
          costCenterId: costCenter.id,
          name: employee.nomfun,
          position: employee.titcar || null,
          status,
          admissionDate: employee.datadm ? new Date(employee.datadm) : null,
          terminationDate: employee.datdem ? new Date(employee.datdem) : null,
          notes: `Importado da Senior - Matrícula: ${employee.numcad}`,
          updatedAt: new Date(),
        };

        if (existing.length > 0) {
          // Atualizar funcionário existente
          await db
            .update(clientEmployees)
            .set(employeeData)
            .where(eq(clientEmployees.id, existing[0].id));
          
          updated++;
          console.log(`🔄 Atualizado: ${employee.nomfun} (${employee.codccu})`);
        } else {
          // Inserir novo funcionário
          await db
            .insert(clientEmployees)
            .values({
              ...employeeData,
              createdAt: new Date(),
            });
          
          imported++;
          console.log(`✅ Importado: ${employee.nomfun} (${employee.codccu})`);
        }
      } catch (error) {
        console.error(`❌ Erro ao importar ${employee.nomfun}:`, error);
        errors++;
      }
    }

    console.log('\n═══════════════════════════════════════');
    console.log('📊 RESUMO DA IMPORTAÇÃO');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Novos funcionários importados: ${imported}`);
    console.log(`🔄 Funcionários atualizados: ${updated}`);
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
