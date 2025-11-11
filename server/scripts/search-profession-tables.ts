import { db } from '../db';

async function searchProfessionTables() {
  try {
    console.log('Buscando tabelas relacionadas a profissões/cargos no Senior...\n');

    // Get Senior integration settings
    const settings = await db.query.seniorIntegrationSettings.findFirst({
      where: (settings, { eq }) => eq(settings.isActive, true),
    });

    if (!settings) {
      console.error('❌ Senior integration is not configured or active');
      process.exit(1);
    }

    console.log('✓ Senior integration configured\n');

    // Get all tables
    console.log('Buscando todas as tabelas...');
    const tablesResponse = await fetch(`${settings.apiUrl}/tables`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
      },
    });

    if (!tablesResponse.ok) {
      throw new Error(`Failed to fetch tables: ${tablesResponse.status}`);
    }

    const tables = await tablesResponse.json();
    
    // Filter tables that might contain profession/job data
    const professionRelatedKeywords = [
      'CAR', // Cargo
      'PRO', // Profissão
      'FUN', // Função
      'OCU', // Ocupação
      'CBO', // CBO (Classificação Brasileira de Ocupações)
    ];

    const relatedTables = tables.filter((table: any) => {
      const tableName = table.TABLE_NAME.toUpperCase();
      return professionRelatedKeywords.some(keyword => tableName.includes(keyword));
    });

    console.log(`\n✓ Encontradas ${relatedTables.length} tabelas relacionadas:\n`);
    
    relatedTables.forEach((table: any) => {
      console.log(`  - ${table.TABLE_NAME}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('DETALHES DAS TABELAS MAIS RELEVANTES');
    console.log('='.repeat(70) + '\n');

    // Check specific tables that are likely to contain professions
    const tablesToCheck = [
      { name: 'R006CAR', description: 'Cargos' },
      { name: 'R034FUN', description: 'Funções' },
      { name: 'R043CBO', description: 'CBO - Classificação Brasileira de Ocupações' }
    ];
    
    for (const table of tablesToCheck) {
      try {
        console.log(`\n📋 ${table.name} - ${table.description}`);
        console.log('-'.repeat(70));
        
        const queryResponse = await fetch(`${settings.apiUrl}/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': settings.apiKey,
          },
          body: JSON.stringify({
            sqlText: `SELECT TOP 5 * FROM ${table.name}`,
          }),
        });

        if (queryResponse.ok) {
          const data = await queryResponse.json();
          
          if (data && data.length > 0) {
            console.log(`✓ ${data.length} registros encontrados`);
            console.log(`\n📊 Campos disponíveis:`);
            const fields = Object.keys(data[0]);
            fields.forEach(field => console.log(`   - ${field}`));
            
            console.log(`\n📝 Exemplos de registros:`);
            data.slice(0, 3).forEach((row: any, idx: number) => {
              console.log(`\n   ${idx + 1})`);
              Object.entries(row).forEach(([key, value]) => {
                if (value !== null && value !== '') {
                  console.log(`      ${key}: ${value}`);
                }
              });
            });
          } else {
            console.log('⚠ Nenhum registro encontrado nesta tabela');
          }
        } else {
          const errorText = await queryResponse.text();
          console.log(`❌ Erro ao consultar (Status ${queryResponse.status}):`);
          console.log(`   ${errorText.substring(0, 200)}`);
        }
      } catch (err) {
        console.log(`❌ Erro ao processar ${table.name}:`);
        console.log(`   ${err instanceof Error ? err.message : err}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('Busca concluída!');
    console.log('='.repeat(70));

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erro fatal:');
    console.error(error);
    process.exit(1);
  }
}

searchProfessionTables();
