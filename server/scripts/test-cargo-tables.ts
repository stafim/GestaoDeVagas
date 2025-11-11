import { db } from '../db';

async function testCargoTables() {
  try {
    const settings = await db.query.seniorIntegrationSettings.findFirst({
      where: (settings, { eq }) => eq(settings.isActive, true),
    });

    if (!settings) {
      console.error('Senior integration not configured');
      process.exit(1);
    }

    console.log('='.repeat(80));
    console.log('TESTE DE TABELAS DE CARGOS');
    console.log('='.repeat(80) + '\n');

    const tablesToTest = [
      'r024car',
      'r017car',
      'r083car',
      'r350car',
    ];

    for (const tableName of tablesToTest) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📋 Testando: ${tableName.toUpperCase()}`);
      console.log('='.repeat(80));

      try {
        // Test count
        const countResponse = await fetch(`${settings.apiUrl}/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': settings.apiKey,
          },
          body: JSON.stringify({
            sqlText: `SELECT COUNT(*) as total FROM ${tableName}`,
          }),
        });

        if (!countResponse.ok) {
          console.log(`❌ Tabela inacessível (Status: ${countResponse.status})`);
          continue;
        }

        const countData = await countResponse.json();
        const total = countData[0]?.total || 0;
        console.log(`✓ Total de registros: ${total}`);

        if (total === 0) {
          console.log('⚠️ Tabela vazia');
          continue;
        }

        // Get sample data
        const sampleResponse = await fetch(`${settings.apiUrl}/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': settings.apiKey,
          },
          body: JSON.stringify({
            sqlText: `SELECT TOP 3 * FROM ${tableName}`,
          }),
        });

        if (sampleResponse.ok) {
          const samples = await sampleResponse.json();
          
          if (samples && samples.length > 0) {
            console.log(`\n📊 Campos (${Object.keys(samples[0]).length} total):`);
            console.log(Object.keys(samples[0]).join(', '));
            
            console.log(`\n📝 Exemplos:`);
            samples.forEach((row: any, idx: number) => {
              console.log(`\n${idx + 1}.`);
              Object.entries(row).forEach(([key, value]) => {
                if (value !== null && value !== '' && String(value).length > 0) {
                  console.log(`   ${key}: ${String(value).substring(0, 50)}`);
                }
              });
            });
          }
        }

      } catch (err) {
        console.log(`❌ Erro: ${err instanceof Error ? err.message : err}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('TESTE CONCLUÍDO');
    console.log('='.repeat(80));

    process.exit(0);

  } catch (error) {
    console.error('Erro fatal:', error);
    process.exit(1);
  }
}

testCargoTables();
