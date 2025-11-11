import { createSeniorIntegrationService } from '../services/seniorIntegration';

const SENIOR_API_URL = process.env.SENIOR_API_URL;
const SENIOR_API_KEY = process.env.SENIOR_API_KEY;

if (!SENIOR_API_URL || !SENIOR_API_KEY) {
  throw new Error('SENIOR_API_URL ou SENIOR_API_KEY não estão configurados');
}

async function findDivisionNames() {
  console.log('🔍 BUSCANDO NOMES DAS DIVISÕES NA SENIOR HCM\n');
  console.log('='.repeat(80) + '\n');

  try {
    const seniorService = createSeniorIntegrationService({
      apiUrl: SENIOR_API_URL!,
      apiKey: SENIOR_API_KEY!,
    });

    // Códigos de divisão encontrados: 1, 2, 3, 4, 5, 6, 11
    console.log('📊 Códigos de divisão encontrados em r034fun:');
    console.log('   depirf: 1, 2, 3, 4, 5, 6, 11');
    console.log('   depsaf: 1, 2, 3, 4, 5\n');

    // Buscar em tabelas possíveis de cadastro de divisões
    const divisionTables = [
      { table: 'r030div', keyCol: 'coddiv', nameCol: 'nomdiv' },
      { table: 'r014div', keyCol: 'coddiv', nameCol: 'nomdiv' },
      { table: 'r038div', keyCol: 'coddiv', nameCol: 'nomdiv' },
      { table: 'usu_tdivare', keyCol: null, nameCol: null }, // Tabela customizada
      { table: 'r070div', keyCol: 'coddiv', nameCol: 'nomdiv' },
      { table: 'r036dep', keyCol: 'coddep', nameCol: 'nomdep' }, // Pode ser departamentos
    ];

    for (const { table, keyCol, nameCol } of divisionTables) {
      console.log(`\n📋 Verificando tabela: ${table}`);
      console.log('-'.repeat(80));

      try {
        const query = `SELECT TOP 20 * FROM ${table}`;
        const results = await seniorService.executeQuery<any>(query);

        if (results && results.length > 0) {
          console.log(`✅ ${results.length} registros encontrados\n`);
          
          // Mostrar estrutura
          const columns = Object.keys(results[0]);
          console.log('📋 Colunas:', columns.join(', '));
          
          // Procurar por colunas que parecem código e nome de divisão
          const codCols = columns.filter(c => 
            c.toLowerCase().includes('cod') || 
            c.toLowerCase().includes('num') ||
            c === 'id'
          );
          const nomCols = columns.filter(c => 
            c.toLowerCase().includes('nom') || 
            c.toLowerCase().includes('des') ||
            c.toLowerCase().includes('name')
          );

          console.log('\n🔍 Colunas de código:', codCols.join(', '));
          console.log('🔍 Colunas de nome:', nomCols.join(', '));

          // Mostrar dados
          console.log('\n📝 Primeiros registros:\n');
          results.slice(0, 10).forEach((record, index) => {
            console.log(`   ${index + 1}. ${JSON.stringify(record)}`);
          });

        } else {
          console.log('⚠️  Tabela vazia');
        }
      } catch (error: any) {
        if (error.message?.includes('Invalid object name')) {
          console.log('❌ Tabela não existe');
        } else {
          console.log(`⚠️  Erro: ${error.message}`);
        }
      }
    }

    // Buscar em tabelas do sistema (sys)
    console.log('\n\n🔍 BUSCANDO TABELAS COM "DIV" NO NOME\n');
    console.log('='.repeat(80) + '\n');

    try {
      const listTablesQuery = `
        SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME LIKE '%div%' 
        AND (COLUMN_NAME LIKE '%nom%' OR COLUMN_NAME LIKE '%des%')
        ORDER BY TABLE_NAME, ORDINAL_POSITION
      `;
      const tableColumns = await seniorService.executeQuery<any>(listTablesQuery);
      
      if (tableColumns && tableColumns.length > 0) {
        console.log(`✅ ${tableColumns.length} colunas encontradas em tabelas com "div":\n`);
        
        let currentTable = '';
        tableColumns.forEach(tc => {
          if (tc.TABLE_NAME !== currentTable) {
            currentTable = tc.TABLE_NAME;
            console.log(`\n📊 ${tc.TABLE_NAME}:`);
          }
          console.log(`   - ${tc.COLUMN_NAME} (${tc.DATA_TYPE})`);
        });
      } else {
        console.log('⚠️  Nenhuma coluna encontrada');
      }
    } catch (error: any) {
      console.log(`⚠️  Erro ao listar colunas: ${error.message}`);
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

findDivisionNames()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
