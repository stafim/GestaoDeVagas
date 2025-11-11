import { db } from '../db';
import { divisions } from '../../shared/schema';
import { createSeniorIntegrationService } from '../services/seniorIntegration';
import { eq } from 'drizzle-orm';

const SENIOR_API_URL = process.env.SENIOR_API_URL;
const SENIOR_API_KEY = process.env.SENIOR_API_KEY;

if (!SENIOR_API_URL || !SENIOR_API_KEY) {
  throw new Error('SENIOR_API_URL ou SENIOR_API_KEY não estão configurados');
}

interface SeniorDivision {
  usu_coddiv: number;
  usu_desdiv: string;
}

async function importDivisions() {
  console.log('🏢 IMPORTANDO DIVISÕES DA SENIOR HCM\n');
  console.log('='.repeat(80) + '\n');

  try {
    const seniorService = createSeniorIntegrationService({
      apiUrl: SENIOR_API_URL!,
      apiKey: SENIOR_API_KEY!,
    });

    // Buscar divisões da tabela usu_tdivare
    console.log('📋 Buscando divisões da Senior...');
    const query = 'SELECT usu_coddiv, usu_desdiv FROM usu_tdivare ORDER BY usu_coddiv';
    const seniorDivisions = await seniorService.executeQuery<SeniorDivision>(query);

    if (!seniorDivisions || seniorDivisions.length === 0) {
      console.log('⚠️  Nenhuma divisão encontrada na Senior');
      return;
    }

    console.log(`✅ ${seniorDivisions.length} divisões encontradas na Senior\n`);

    // Importar cada divisão
    let inserted = 0;
    let updated = 0;

    for (const seniorDiv of seniorDivisions) {
      try {
        // Verificar se a divisão já existe
        const existing = await db.query.divisions.findFirst({
          where: eq(divisions.code, seniorDiv.usu_coddiv),
        });

        if (existing) {
          // Atualizar nome se mudou
          if (existing.name !== seniorDiv.usu_desdiv) {
            await db.update(divisions)
              .set({
                name: seniorDiv.usu_desdiv,
                updatedAt: new Date(),
              })
              .where(eq(divisions.id, existing.id));
            
            console.log(`📝 Atualizado: ${seniorDiv.usu_coddiv} - ${seniorDiv.usu_desdiv}`);
            updated++;
          } else {
            console.log(`⏭️  Já existe: ${seniorDiv.usu_coddiv} - ${seniorDiv.usu_desdiv}`);
          }
        } else {
          // Inserir nova divisão
          await db.insert(divisions).values({
            code: seniorDiv.usu_coddiv,
            name: seniorDiv.usu_desdiv,
            isActive: true,
          });

          console.log(`✅ Inserido: ${seniorDiv.usu_coddiv} - ${seniorDiv.usu_desdiv}`);
          inserted++;
        }
      } catch (error: any) {
        console.error(`❌ Erro ao processar divisão ${seniorDiv.usu_coddiv}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMO DA IMPORTAÇÃO:');
    console.log(`   ✅ Inseridas: ${inserted}`);
    console.log(`   📝 Atualizadas: ${updated}`);
    console.log(`   📋 Total: ${seniorDivisions.length}`);
    console.log('='.repeat(80));

  } catch (error: any) {
    console.error('\n❌ Erro durante a importação:', error.message);
    if (error.response?.data) {
      console.error('Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

importDivisions()
  .then(() => {
    console.log('\n✅ Importação concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
