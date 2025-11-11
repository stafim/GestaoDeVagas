import { db } from '../db';

async function searchWorkPositions() {
  try {
    console.log('='.repeat(80));
    console.log('BUSCA DE TABELAS DE POSTOS DE TRABALHO NO SENIOR HCM');
    console.log('='.repeat(80) + '\n');

    const settings = await db.query.seniorIntegrationSettings.findFirst({
      where: (settings, { eq }) => eq(settings.isActive, true),
    });

    if (!settings) {
      console.error('Senior integration not configured');
      process.exit(1);
    }

    // Get all table names
    const tablesResponse = await fetch(`${settings.apiUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
      },
      body: JSON.stringify({
        sqlText: `
          SELECT TABLE_NAME 
          FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_TYPE = 'BASE TABLE'
          ORDER BY TABLE_NAME
        `,
      }),
    });

    if (!tablesResponse.ok) {
      throw new Error(`Failed to get tables: ${tablesResponse.status}`);
    }

    const allTables = await tablesResponse.json();
    const tableNames = allTables.map((t: any) => t.TABLE_NAME);

    console.log(`✓ Total de tabelas no banco: ${tableNames.length}\n`);

    // Search for position/work-related tables
    const keywords = [
      'pos',     // posto, position
      'trab',    // trabalho
      'loc',     // local, localização
      'setor',   // setor
      'area',    // área
      'fun',     // função
      'car',     // cargo (já sabemos)
    ];

    const matches: { [key: string]: string[] } = {};
    
    keywords.forEach(keyword => {
      matches[keyword] = tableNames.filter((name: string) => 
        name.toLowerCase().includes(keyword.toLowerCase())
      );
    });

    console.log('📋 TABELAS ENCONTRADAS POR PALAVRA-CHAVE:\n');
    console.log('='.repeat(80));

    for (const [keyword, tables] of Object.entries(matches)) {
      if (tables.length > 0) {
        console.log(`\n🔍 Palavra-chave: "${keyword.toUpperCase()}" (${tables.length} tabelas)`);
        console.log('-'.repeat(80));
        tables.forEach(table => console.log(`   - ${table}`));
      }
    }

    // Focus on 'pos' tables (posto/position)
    const posTables = matches['pos'] || [];
    
    if (posTables.length > 0) {
      console.log('\n\n' + '='.repeat(80));
      console.log('DETALHES DAS TABELAS DE POSTOS (POS):');
      console.log('='.repeat(80));

      for (const tableName of posTables.slice(0, 10)) { // Limit to first 10
        console.log(`\n${'─'.repeat(80)}`);
        console.log(`📋 Tabela: ${tableName.toUpperCase()}`);
        console.log('─'.repeat(80));

        try {
          // Get row count
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

          if (countResponse.ok) {
            const countData = await countResponse.json();
            const total = countData[0]?.total || 0;
            console.log(`✓ Registros: ${total}`);

            if (total > 0) {
              // Get sample data
              const sampleResponse = await fetch(`${settings.apiUrl}/query`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': settings.apiKey,
                },
                body: JSON.stringify({
                  sqlText: `SELECT TOP 2 * FROM ${tableName}`,
                }),
              });

              if (sampleResponse.ok) {
                const samples = await sampleResponse.json();
                
                if (samples && samples.length > 0) {
                  console.log(`\n📊 Campos (${Object.keys(samples[0]).length} total):`);
                  const fields = Object.keys(samples[0]);
                  
                  // Show fields in rows of 8
                  for (let i = 0; i < fields.length; i += 8) {
                    console.log('   ' + fields.slice(i, i + 8).join(', '));
                  }
                  
                  console.log(`\n📝 Exemplo de registro:`);
                  const sample = samples[0];
                  
                  // Show only non-null, non-empty values
                  Object.entries(sample).forEach(([key, value]) => {
                    if (value !== null && value !== '' && String(value).trim().length > 0) {
                      const strValue = String(value);
                      console.log(`   ${key}: ${strValue.substring(0, 80)}`);
                    }
                  });
                }
              }
            } else {
              console.log('⚠️ Tabela vazia');
            }
          }
        } catch (err) {
          console.log(`❌ Erro ao consultar: ${err instanceof Error ? err.message : err}`);
        }
      }
    }

    // Also check r017car (positions table we found earlier)
    console.log('\n\n' + '='.repeat(80));
    console.log('ANÁLISE DETALHADA: r017car (Tabela de Posições)');
    console.log('='.repeat(80));

    try {
      const sampleResponse = await fetch(`${settings.apiUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.apiKey,
        },
        body: JSON.stringify({
          sqlText: `
            SELECT TOP 5
              estpos, postra, estcar, codcar, numemp, codfil, 
              taborg, numloc, codccu, datini, datfim
            FROM r017car 
            WHERE estcar > 0 AND codcar IS NOT NULL
            ORDER BY estpos, postra
          `,
        }),
      });

      if (sampleResponse.ok) {
        const samples = await sampleResponse.json();
        
        if (samples && samples.length > 0) {
          console.log('\n📝 Exemplos de Postos de Trabalho (r017car):');
          console.log('-'.repeat(80));
          
          samples.forEach((row: any, idx: number) => {
            console.log(`\n${idx + 1}. Posto: ${row.postra}`);
            console.log(`   Estabelecimento: ${row.estpos} | Cargo: ${row.estcar}-${row.codcar}`);
            console.log(`   Empresa: ${row.numemp} | Filial: ${row.codfil}`);
            if (row.numloc) console.log(`   Local: ${row.numloc}`);
            if (row.codccu) console.log(`   Centro de Custo: ${row.codccu}`);
            console.log(`   Período: ${row.datini ? new Date(row.datini).toLocaleDateString() : 'N/A'} até ${row.datfim ? new Date(row.datfim).toLocaleDateString() : 'N/A'}`);
          });
        }
      }
    } catch (err) {
      console.log(`❌ Erro: ${err instanceof Error ? err.message : err}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('BUSCA CONCLUÍDA');
    console.log('='.repeat(80));

    process.exit(0);

  } catch (error) {
    console.error('Erro fatal:', error);
    process.exit(1);
  }
}

searchWorkPositions();
