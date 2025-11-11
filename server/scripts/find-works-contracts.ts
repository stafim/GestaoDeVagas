import { db } from '../db';
import { seniorIntegrationSettings } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface SeniorAPIService {
  executeQuery<T>(sqlText: string): Promise<T[]>;
}

function createSeniorAPIService(apiUrl: string, apiKey: string): SeniorAPIService {
  return {
    async executeQuery<T>(sqlText: string): Promise<T[]> {
      const response = await fetch(`${apiUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ sqlText }),
      });

      if (!response.ok) {
        throw new Error(`Query failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    }
  };
}

async function findWorksContracts() {
  try {
    console.log('🔍 Buscando em tabelas de obras, contratos e projetos...\n');

    const settings = await db.query.seniorIntegrationSettings.findFirst({
      where: eq(seniorIntegrationSettings.isActive, true),
    });

    if (!settings) {
      console.error('❌ Senior integration is not configured or active');
      process.exit(1);
    }

    const seniorService = createSeniorAPIService(settings.apiUrl, settings.apiKey);

    // Tabelas que podem conter obras/contratos/clientes
    const tables = [
      'r015obr',  // Obras
      'r016obr',  // Contratos/Obras
      'r017obr',  // Projetos
      'r019obr',  // Obras diversas
      'r043obr',  // Obras/contratos
      'e043obr',  // Obras
      'usu_tobras', // Tabela customizada de obras
      'usu_tcontrato', // Tabela customizada de contratos
      'usu_tprojeto', // Tabela customizada de projetos
    ];

    for (const tableName of tables) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📋 Verificando: ${tableName}`);
      console.log('='.repeat(80));

      try {
        // Tenta buscar alguns registros
        const query = `SELECT TOP 30 * FROM ${tableName}`;
        const data = await seniorService.executeQuery(query);
        
        if (data && data.length > 0) {
          const columns = Object.keys(data[0]);
          console.log(`✅ Tabela encontrada! Registros: ${data.length}`);
          console.log(`📊 Colunas (${columns.length}): ${columns.join(', ')}\n`);

          // Identifica colunas importantes
          const nameColumns = columns.filter(col => 
            col.toLowerCase().includes('nom') || 
            col.toLowerCase().includes('raz') ||
            col.toLowerCase().includes('des')
          );
          
          const codeColumns = columns.filter(col =>
            col.toLowerCase().includes('cod') || 
            col.toLowerCase().includes('num')
          );

          console.log(`📍 Colunas de nome: ${nameColumns.join(', ')}`);
          console.log(`📍 Colunas de código: ${codeColumns.join(', ')}\n`);

          // Mostra alguns exemplos
          console.log('📄 Exemplos de registros:');
          data.slice(0, 5).forEach((row, idx) => {
            console.log(`\n  ${idx + 1}. ${'-'.repeat(70)}`);
            Object.entries(row).forEach(([key, value]) => {
              if (value !== null && value !== '' && String(value).trim() !== '') {
                console.log(`     ${key}: ${value}`);
              }
            });
          });

          // Busca especificamente por Localiza e Stellantis
          if (nameColumns.length > 0) {
            console.log(`\n\n🔎 Buscando "Localiza" e "Stellantis"...`);
            
            const conditions = nameColumns.map(col => 
              `${col} LIKE '%Localiza%' OR ${col} LIKE '%Stellantis%' OR ${col} LIKE '%Stelantis%'`
            ).join(' OR ');

            const searchQuery = `SELECT * FROM ${tableName} WHERE ${conditions}`;
            
            try {
              const results = await seniorService.executeQuery(searchQuery);
              
              if (results && results.length > 0) {
                console.log(`\n✅ *** ENCONTRADO! *** ${results.length} registro(s):\n`);
                results.forEach((row, idx) => {
                  console.log(`  ${idx + 1}. ${'='.repeat(70)}`);
                  Object.entries(row).forEach(([key, value]) => {
                    if (value !== null && value !== '') {
                      console.log(`     ${key}: ${value}`);
                    }
                  });
                  console.log('');
                });
              } else {
                console.log(`  ⚪ Não encontrado`);
              }
            } catch (searchError) {
              console.log(`  ⚠️  Erro na busca: ${searchError instanceof Error ? searchError.message : searchError}`);
            }
          }

          // Também busca por código 000003 se existir colunas de código
          if (codeColumns.length > 0) {
            console.log(`\n🔎 Buscando código 000003...`);
            
            const codeConditions = codeColumns.map(col => 
              `${col} = '000003' OR ${col} = '3'`
            ).join(' OR ');

            const codeQuery = `SELECT TOP 10 * FROM ${tableName} WHERE ${codeConditions}`;
            
            try {
              const codeResults = await seniorService.executeQuery(codeQuery);
              
              if (codeResults && codeResults.length > 0) {
                console.log(`\n✅ Código 000003 encontrado! ${codeResults.length} registro(s):\n`);
                codeResults.forEach((row, idx) => {
                  console.log(`  ${idx + 1}. ${'-'.repeat(70)}`);
                  Object.entries(row).forEach(([key, value]) => {
                    if (value !== null && value !== '') {
                      console.log(`     ${key}: ${value}`);
                    }
                  });
                  console.log('');
                });
              }
            } catch (codeError) {
              // Ignora
            }
          }

        } else {
          console.log('⚪ Tabela vazia ou sem registros');
        }

      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid object name')) {
          console.log(`❌ Tabela ${tableName} não existe`);
        } else {
          console.log(`❌ Erro: ${error instanceof Error ? error.message : error}`);
        }
      }
    }

    console.log('\n\n' + '='.repeat(80));
    console.log('Busca concluída!');
    console.log('='.repeat(80));

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error:');
    console.error(error);
    process.exit(1);
  }
}

findWorksContracts();
