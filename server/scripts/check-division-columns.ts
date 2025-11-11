import { createSeniorIntegrationService } from '../services/seniorIntegration';

const SENIOR_API_URL = process.env.SENIOR_API_URL;
const SENIOR_API_KEY = process.env.SENIOR_API_KEY;

if (!SENIOR_API_URL || !SENIOR_API_KEY) {
  throw new Error('SENIOR_API_URL ou SENIOR_API_KEY não estão configurados');
}

async function checkDivisionColumns() {
  console.log('🔍 VERIFICANDO COLUNAS DE DIVISÃO NA SENIOR HCM\n');
  console.log('='.repeat(80) + '\n');

  try {
    const seniorService = createSeniorIntegrationService({
      apiUrl: SENIOR_API_URL!,
      apiKey: SENIOR_API_KEY!,
    });

    // Buscar registros de r034fun para ver as colunas
    console.log('📋 Verificando colunas de r034fun...\n');
    
    const query = 'SELECT TOP 5 * FROM r034fun';
    const results = await seniorService.executeQuery<any>(query);
    
    if (results && results.length > 0) {
      const columns = Object.keys(results[0]);
      console.log(`✅ ${columns.length} colunas encontradas:\n`);
      console.log(columns.join(', '));
      
      // Filtrar colunas relacionadas a divisões
      const divColumns = columns.filter(c => 
        c.toLowerCase().includes('div') || 
        c.toLowerCase().includes('setor') ||
        c.toLowerCase().includes('area') ||
        c.toLowerCase().includes('dep')
      );
      
      if (divColumns.length > 0) {
        console.log('\n\n📊 Colunas relacionadas a divisões/setores:\n');
        divColumns.forEach(col => console.log(`   - ${col}`));
        
        console.log('\n\n📝 Exemplos de valores:\n');
        results.forEach((record, index) => {
          console.log(`   Funcionário ${index + 1}:`);
          divColumns.forEach(col => {
            console.log(`      ${col}: ${record[col]}`);
          });
          console.log('');
        });

        // Se encontrou campos de divisão, buscar valores distintos
        if (divColumns.length > 0) {
          console.log('\n\n📊 Buscando valores distintos de divisões...\n');
          
          for (const col of divColumns.slice(0, 3)) {  // Apenas os 3 primeiros
            try {
              const distinctQuery = `
                SELECT DISTINCT ${col}
                FROM r034fun
                WHERE ${col} IS NOT NULL AND ${col} != '' AND ${col} != 0
                ORDER BY ${col}
              `;
              const distinctValues = await seniorService.executeQuery<any>(distinctQuery);
              
              if (distinctValues && distinctValues.length > 0) {
                console.log(`\n   ${col}: ${distinctValues.length} valores distintos`);
                distinctValues.slice(0, 10).forEach((v, i) => {
                  console.log(`      ${i + 1}. ${v[col]}`);
                });
              }
            } catch (error: any) {
              console.log(`   ⚠️ Erro ao buscar ${col}: ${error.message}`);
            }
          }
        }
      } else {
        console.log('\n⚠️ Nenhuma coluna de divisão encontrada');
      }

      // Mostrar um funcionário completo para análise
      console.log('\n\n📝 Exemplo de funcionário completo:\n');
      console.log(JSON.stringify(results[0], null, 2));
    }

    console.log('\n\n' + '='.repeat(80));
    console.log('✅ Verificação concluída!');

  } catch (error: any) {
    console.error('\n❌ Erro durante a verificação:', error.message);
    if (error.response?.data) {
      console.error('Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

checkDivisionColumns()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
