import { createSeniorIntegrationService } from '../services/seniorIntegration';

const SENIOR_API_URL = process.env.SENIOR_API_URL;
const SENIOR_API_KEY = process.env.SENIOR_API_KEY;

if (!SENIOR_API_URL || !SENIOR_API_KEY) {
  throw new Error('SENIOR_API_URL ou SENIOR_API_KEY não estão configurados');
}

async function exploreDepartmentTables() {
  console.log('📋 EXPLORANDO TABELAS DE DEPARTAMENTOS/DIVISÕES\n');
  console.log('='.repeat(80) + '\n');

  try {
    const seniorService = createSeniorIntegrationService({
      apiUrl: SENIOR_API_URL!,
      apiKey: SENIOR_API_KEY!,
    });

    const tables = ['r036dep', 'r047dep', 'r051dep', 'usu_tdivare', 'usu_tr036dep'];

    for (const table of tables) {
      console.log(`\n📊 Tabela: ${table}`);
      console.log('='.repeat(80));
      
      try {
        const query = `SELECT TOP 20 * FROM ${table}`;
        const results = await seniorService.executeQuery<any>(query);
        
        if (results && results.length > 0) {
          console.log(`✅ ${results.length} registros encontrados\n`);
          
          const columns = Object.keys(results[0]);
          console.log('📋 Colunas:', columns.join(', '));
          
          console.log('\n📝 Dados:\n');
          results.forEach((record, index) => {
            console.log(`   ${index + 1}. ${JSON.stringify(record)}`);
          });
        } else {
          console.log('⚠️  Tabela vazia');
        }
      } catch (error: any) {
        console.log(`❌ Erro: ${error.message}`);
      }
    }

    console.log('\n\n' + '='.repeat(80));
    console.log('✅ Exploração concluída!');

  } catch (error: any) {
    console.error('\n❌ Erro durante a exploração:', error.message);
  }
}

exploreDepartmentTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
