import { createSeniorIntegrationService } from '../services/seniorIntegration';

const SENIOR_API_URL = process.env.SENIOR_API_URL;
const SENIOR_API_KEY = process.env.SENIOR_API_KEY;

if (!SENIOR_API_URL || !SENIOR_API_KEY) {
  throw new Error('SENIOR_API_URL ou SENIOR_API_KEY não estão configurados');
}

async function searchWorkScales() {
  console.log('🔍 BUSCANDO ESCALAS DE TRABALHO NA SENIOR HCM (SQL Server)\n');
  console.log('='.repeat(80) + '\n');

  try {
    const seniorService = createSeniorIntegrationService({
      apiUrl: SENIOR_API_URL!,
      apiKey: SENIOR_API_KEY!,
    });

    // Primeiro, listar todas as tabelas disponíveis que começam com 'r0'
    console.log('📊 Listando todas as tabelas do sistema Senior...\n');
    try {
      const listTablesQuery = `
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_NAME LIKE 'r0%'
        ORDER BY TABLE_NAME
      `;
      const tables = await seniorService.executeQuery<{ TABLE_NAME: string }>(listTablesQuery);
      
      if (tables && tables.length > 0) {
        console.log(`✅ ${tables.length} tabelas encontradas que começam com 'r0':\n`);
        tables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));
        console.log('\n' + '='.repeat(80) + '\n');
      }
    } catch (error: any) {
      console.log('⚠️  Não foi possível listar tabelas:', error.message);
    }

    // Lista de tabelas comuns que podem conter escalas/horários de trabalho
    const possibleTables = [
      { name: 'r005esc', description: 'Escalas' },
      { name: 'r038hra', description: 'Horários' },
      { name: 'r022hor', description: 'Horários de Trabalho' },
      { name: 'r005hor', description: 'Horários (r005)' },
      { name: 'r012esc', description: 'Escalas (r012)' },
      { name: 'r030esc', description: 'Escalas (r030)' },
      { name: 'r022esc', description: 'Escalas (r022)' },
      { name: 'r008esc', description: 'Escalas (r008)' },
      { name: 'r014esc', description: 'Escalas (r014)' },
    ];

    for (const table of possibleTables) {
      console.log(`\n📋 Verificando tabela: ${table.name} - ${table.description}`);
      console.log('-'.repeat(80));

      try {
        // SQL Server usa TOP ao invés de ROWNUM
        const query = `SELECT TOP 5 * FROM ${table.name}`;
        const results = await seniorService.executeQuery<any>(query);

        if (results && results.length > 0) {
          console.log(`✅ Tabela encontrada! ${results.length} registros de exemplo\n`);
          
          // Mostrar estrutura da tabela (colunas)
          console.log('📊 Estrutura da tabela (colunas):');
          const columns = Object.keys(results[0]);
          columns.forEach(col => {
            console.log(`   - ${col}`);
          });

          // Mostrar alguns exemplos de dados
          console.log('\n📝 Exemplos de registros:');
          results.forEach((record, index) => {
            console.log(`\n   Registro ${index + 1}:`);
            Object.entries(record).forEach(([key, value]) => {
              console.log(`      ${key}: ${value}`);
            });
          });
        } else {
          console.log('⚠️  Tabela existe mas não contém registros');
        }
      } catch (error: any) {
        if (error.message?.includes('ORA-00942') || error.message?.includes('não existe')) {
          console.log('❌ Tabela não encontrada no banco Senior');
        } else {
          console.log(`⚠️  Erro ao acessar tabela: ${error.message}`);
        }
      }
    }

    // Tentar buscar em tabelas genéricas
    console.log('\n\n🔍 BUSCA GENÉRICA POR ESCALAS/HORÁRIOS\n');
    console.log('='.repeat(80) + '\n');

    // Buscar em r034fun para ver se há referência a escalas
    console.log('📋 Verificando r034fun (Funcionários) para campos relacionados a escalas...\n');
    try {
      const queryFun = `SELECT TOP 3 * FROM r034fun`;
      const funResults = await seniorService.executeQuery<any>(queryFun);
      
      if (funResults && funResults.length > 0) {
        console.log('📊 Campos disponíveis em r034fun:');
        const funColumns = Object.keys(funResults[0]);
        const scaleRelatedColumns = funColumns.filter(col => 
          col.toLowerCase().includes('esc') || 
          col.toLowerCase().includes('hor') ||
          col.toLowerCase().includes('jor') ||
          col.toLowerCase().includes('turno')
        );
        
        if (scaleRelatedColumns.length > 0) {
          console.log('✅ Campos relacionados a escalas/horários encontrados:');
          scaleRelatedColumns.forEach(col => console.log(`   - ${col}`));
          
          console.log('\n📝 Exemplos de valores:');
          funResults.forEach((record, index) => {
            console.log(`\n   Funcionário ${index + 1}:`);
            scaleRelatedColumns.forEach(col => {
              console.log(`      ${col}: ${record[col]}`);
            });
          });
        } else {
          console.log('⚠️  Nenhum campo relacionado a escalas encontrado');
          console.log('\n📊 Todos os campos disponíveis:');
          funColumns.forEach(col => console.log(`   - ${col}`));
        }
      }
    } catch (error: any) {
      console.log(`⚠️  Erro ao buscar em r034fun: ${error.message}`);
    }

    console.log('\n\n✅ Busca concluída!');
    console.log('='.repeat(80));

  } catch (error: any) {
    console.error('\n❌ Erro durante a busca:', error.message);
    if (error.response?.data) {
      console.error('Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

searchWorkScales()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
