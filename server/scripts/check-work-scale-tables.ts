import { createSeniorIntegrationService } from '../services/seniorIntegration';

const SENIOR_API_URL = process.env.SENIOR_API_URL;
const SENIOR_API_KEY = process.env.SENIOR_API_KEY;

if (!SENIOR_API_URL || !SENIOR_API_KEY) {
  throw new Error('SENIOR_API_URL ou SENIOR_API_KEY não estão configurados');
}

async function checkWorkScaleTables() {
  console.log('🔍 VERIFICANDO TABELAS DE ESCALAS/HORÁRIOS NA SENIOR\n');
  console.log('='.repeat(80) + '\n');

  try {
    const seniorService = createSeniorIntegrationService({
      apiUrl: SENIOR_API_URL!,
      apiKey: SENIOR_API_KEY!,
    });

    // Tabelas específicas que parecem conter escalas/horários
    const targetTables = [
      'r006esc',  // Escalas
      'r006hor',  // Horários
      'r005tur',  // Turnos
      'r004hor',  // Horários (outra tabela)
    ];

    for (const tableName of targetTables) {
      console.log(`\n📋 Tabela: ${tableName}`);
      console.log('-'.repeat(80));

      try {
        // Buscar registros
        const query = `SELECT TOP 10 * FROM ${tableName}`;
        const results = await seniorService.executeQuery<any>(query);

        if (results && results.length > 0) {
          console.log(`✅ ${results.length} registros encontrados\n`);
          
          // Mostrar estrutura
          console.log('📊 Estrutura da tabela:');
          const columns = Object.keys(results[0]);
          columns.forEach(col => console.log(`   - ${col}`));
          
          // Mostrar exemplos
          console.log('\n📝 Exemplos de dados:\n');
          results.slice(0, 5).forEach((record, index) => {
            console.log(`   Registro ${index + 1}:`);
            Object.entries(record).forEach(([key, value]) => {
              const displayValue = value !== null && value !== undefined ? String(value).substring(0, 100) : 'NULL';
              console.log(`      ${key}: ${displayValue}`);
            });
            console.log('');
          });
        } else {
          console.log('⚠️  Tabela vazia (sem registros)');
        }
      } catch (error: any) {
        console.log(`❌ Erro: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Verificação concluída!');

  } catch (error: any) {
    console.error('\n❌ Erro durante a verificação:', error.message);
    if (error.response?.data) {
      console.error('Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

checkWorkScaleTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
