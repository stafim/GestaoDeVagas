import { createSeniorIntegrationService } from '../services/seniorIntegration';

const SENIOR_API_URL = process.env.SENIOR_API_URL;
const SENIOR_API_KEY = process.env.SENIOR_API_KEY;

if (!SENIOR_API_URL || !SENIOR_API_KEY) {
  throw new Error('SENIOR_API_URL ou SENIOR_API_KEY não estão configurados');
}

async function findDivisions() {
  console.log('🔍 BUSCANDO DIVISÕES ORGANIZACIONAIS NA SENIOR HCM\n');
  console.log('='.repeat(80) + '\n');

  try {
    const seniorService = createSeniorIntegrationService({
      apiUrl: SENIOR_API_URL!,
      apiKey: SENIOR_API_KEY!,
    });

    // Buscar divisões distintas na tabela de funcionários (r034fun)
    console.log('📋 Buscando divisões em r034fun (coddiv, nomdiv)...\n');
    
    const query1 = `
      SELECT DISTINCT coddiv, nomdiv
      FROM r034fun
      WHERE coddiv IS NOT NULL AND nomdiv IS NOT NULL AND nomdiv != ''
      ORDER BY coddiv
    `;
    
    const divisions = await seniorService.executeQuery<{ coddiv: number; nomdiv: string }>(query1);
    
    if (divisions && divisions.length > 0) {
      console.log(`✅ ${divisions.length} divisões encontradas:\n`);
      divisions.forEach((div, index) => {
        console.log(`   ${index + 1}. Código: ${div.coddiv} - Nome: ${div.nomdiv}`);
      });
    } else {
      console.log('⚠️ Nenhuma divisão encontrada em r034fun');
    }

    // Buscar informações adicionais sobre divisões em outras tabelas
    console.log('\n\n📋 Buscando em outras tabelas...\n');
    
    // Verificar se existe uma tabela específica de divisões
    const tables = ['r030div', 'r038div', 'usu_tdivare'];
    
    for (const table of tables) {
      console.log(`\n📊 Verificando ${table}...`);
      try {
        const query = `SELECT TOP 20 * FROM ${table}`;
        const results = await seniorService.executeQuery<any>(query);
        
        if (results && results.length > 0) {
          console.log(`✅ ${results.length} registros encontrados`);
          console.log('📋 Colunas:', Object.keys(results[0]).join(', '));
          console.log('\n📝 Primeiros registros:');
          results.slice(0, 5).forEach((r, i) => {
            console.log(`   ${i + 1}. ${JSON.stringify(r)}`);
          });
        } else {
          console.log('⚠️ Tabela vazia');
        }
      } catch (error: any) {
        if (error.message?.includes('Invalid object name')) {
          console.log('❌ Tabela não existe');
        } else {
          console.log(`⚠️ Erro: ${error.message}`);
        }
      }
    }

    console.log('\n\n' + '='.repeat(80));
    console.log('✅ Busca concluída!');

  } catch (error: any) {
    console.error('\n❌ Erro durante a busca:', error.message);
    if (error.response?.data) {
      console.error('Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

findDivisions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
