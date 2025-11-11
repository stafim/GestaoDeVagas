import { createSeniorIntegrationService } from '../services/seniorIntegration';

const SENIOR_API_URL = process.env.SENIOR_API_URL;
const SENIOR_API_KEY = process.env.SENIOR_API_KEY;

if (!SENIOR_API_URL || !SENIOR_API_KEY) {
  throw new Error('SENIOR_API_URL ou SENIOR_API_KEY não estão configurados');
}

async function searchDivisions() {
  console.log('🔍 BUSCANDO DIVISÕES/DEPARTAMENTOS NA SENIOR HCM\n');
  console.log('='.repeat(80) + '\n');

  try {
    const seniorService = createSeniorIntegrationService({
      apiUrl: SENIOR_API_URL!,
      apiKey: SENIOR_API_KEY!,
    });

    // Possíveis tabelas que podem conter divisões/departamentos
    const possibleTables = [
      'r014div',  // Divisões
      'r034div',  // Divisões (outra tabela)
      'r014dep',  // Departamentos
      'r030div',  // Divisões (r030)
      'r038div',  // Divisões (r038)
      'r018div',  // Divisões (r018)
      'r020div',  // Divisões (r020)
    ];

    console.log('📋 Testando tabelas específicas de divisões...\n');

    for (const tableName of possibleTables) {
      console.log(`\n📊 Testando: ${tableName}`);
      console.log('-'.repeat(80));

      try {
        const query = `SELECT TOP 20 * FROM ${tableName}`;
        const results = await seniorService.executeQuery<any>(query);

        if (results && results.length > 0) {
          console.log(`✅ ENCONTRADO! ${results.length} registros\n`);
          
          // Mostrar estrutura
          const columns = Object.keys(results[0]);
          console.log('📋 Colunas da tabela:');
          columns.forEach(col => console.log(`   - ${col}`));
          
          // Mostrar dados
          console.log('\n📝 Exemplos de divisões:\n');
          results.forEach((record, index) => {
            console.log(`   ${index + 1}. ${JSON.stringify(record, null, 2)}`);
            if (index >= 9) return; // Mostrar no máximo 10
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

    // Buscar em tabelas de funcionários e empresas por campos de divisão
    console.log('\n\n🔍 BUSCANDO CAMPOS DE DIVISÃO EM OUTRAS TABELAS\n');
    console.log('='.repeat(80) + '\n');

    // Verificar r034fun (funcionários) por campos de divisão
    console.log('📋 Verificando r034fun (Funcionários)...\n');
    try {
      const queryFun = `SELECT TOP 5 * FROM r034fun`;
      const funResults = await seniorService.executeQuery<any>(queryFun);
      
      if (funResults && funResults.length > 0) {
        const funColumns = Object.keys(funResults[0]);
        const divisionColumns = funColumns.filter(col => 
          col.toLowerCase().includes('div') || 
          col.toLowerCase().includes('dep') ||
          col.toLowerCase().includes('setor') ||
          col.toLowerCase().includes('area')
        );
        
        if (divisionColumns.length > 0) {
          console.log('✅ Campos relacionados a divisões encontrados:');
          divisionColumns.forEach(col => console.log(`   - ${col}`));
          
          console.log('\n📝 Exemplos de valores:');
          funResults.forEach((record, index) => {
            console.log(`\n   Funcionário ${index + 1}:`);
            divisionColumns.forEach(col => {
              console.log(`      ${col}: ${record[col]}`);
            });
          });

          // Se encontrou códigos de divisão, buscar na tabela de divisões
          const divCodes = [...new Set(funResults
            .map(r => divisionColumns.map(col => r[col]))
            .flat()
            .filter(v => v !== null && v !== undefined))];
          
          if (divCodes.length > 0) {
            console.log(`\n📊 Códigos únicos de divisão encontrados: ${divCodes.join(', ')}`);
          }
        } else {
          console.log('⚠️  Nenhum campo de divisão encontrado');
        }
      }
    } catch (error: any) {
      console.log(`⚠️  Erro ao verificar r034fun: ${error.message}`);
    }

    // Verificar r030emp (empresas) por campos de divisão
    console.log('\n\n📋 Verificando r030emp (Empresas)...\n');
    try {
      const queryEmp = `SELECT TOP 5 * FROM r030emp`;
      const empResults = await seniorService.executeQuery<any>(queryEmp);
      
      if (empResults && empResults.length > 0) {
        const empColumns = Object.keys(empResults[0]);
        const divisionColumns = empColumns.filter(col => 
          col.toLowerCase().includes('div') || 
          col.toLowerCase().includes('dep') ||
          col.toLowerCase().includes('setor') ||
          col.toLowerCase().includes('area')
        );
        
        if (divisionColumns.length > 0) {
          console.log('✅ Campos relacionados a divisões:');
          divisionColumns.forEach(col => console.log(`   - ${col}`));
        } else {
          console.log('⚠️  Nenhum campo de divisão encontrado');
        }
      }
    } catch (error: any) {
      console.log(`⚠️  Erro ao verificar r030emp: ${error.message}`);
    }

    // Buscar tabelas que contenham "div" no nome
    console.log('\n\n🔍 LISTANDO TODAS AS TABELAS COM "DIV" NO NOME\n');
    console.log('='.repeat(80) + '\n');

    try {
      const listTablesQuery = `
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND (TABLE_NAME LIKE '%div%' OR TABLE_NAME LIKE '%dep%' OR TABLE_NAME LIKE '%setor%')
        ORDER BY TABLE_NAME
      `;
      const tables = await seniorService.executeQuery<{ TABLE_NAME: string }>(listTablesQuery);
      
      if (tables && tables.length > 0) {
        console.log(`✅ ${tables.length} tabelas encontradas:\n`);
        tables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));
      } else {
        console.log('⚠️  Nenhuma tabela encontrada');
      }
    } catch (error: any) {
      console.log(`⚠️  Erro ao listar tabelas: ${error.message}`);
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

searchDivisions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
