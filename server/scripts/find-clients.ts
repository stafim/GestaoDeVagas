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

async function findClients() {
  try {
    console.log('🔍 Buscando clientes Localiza e Stellantis na Senior...\n');

    const settings = await db.query.seniorIntegrationSettings.findFirst({
      where: eq(seniorIntegrationSettings.isActive, true),
    });

    if (!settings) {
      console.error('❌ Senior integration is not configured or active');
      process.exit(1);
    }

    console.log('✓ Senior integration settings found');
    console.log(`  API URL: ${settings.apiUrl}\n`);

    const seniorService = createSeniorAPIService(settings.apiUrl, settings.apiKey);

    // Lista de tabelas comuns que podem conter clientes
    const possibleTables = [
      'r034cli',  // Tabela de clientes
      'r001cli',  // Clientes gerais
      'r002cli',  // Cadastro de clientes
      'r030emp',  // Empresas
      'r031emp',  // Empresas cadastradas
      'r070cli',  // Clientes diversos
      'r036dep',  // Pode conter informações de clientes
      'r018ccu',  // Centro de custos (já verificamos)
      'e070emp',  // Empresas
      'e001cli',  // Cadastro de clientes
      'usu_tcliente', // Tabela customizada de clientes
    ];

    const searchTerms = ['Localiza', 'Stellantis', 'Stelantis'];

    for (const table of possibleTables) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📊 Verificando tabela: ${table}`);
      console.log('='.repeat(80));

      try {
        // Primeiro, tenta obter a estrutura da tabela
        console.log('\n📋 Estrutura da tabela:');
        const structureQuery = `SELECT TOP 1 * FROM ${table}`;
        const sampleData = await seniorService.executeQuery(structureQuery);
        
        if (sampleData && sampleData.length > 0) {
          const columns = Object.keys(sampleData[0]);
          console.log(`   Colunas encontradas (${columns.length}):`, columns.join(', '));

          // Identifica colunas que podem conter nomes
          const nameColumns = columns.filter(col => 
            col.toLowerCase().includes('nom') || 
            col.toLowerCase().includes('raz') ||
            col.toLowerCase().includes('des') ||
            col.toLowerCase().includes('name')
          );

          if (nameColumns.length > 0) {
            console.log(`   ✓ Colunas de nome encontradas:`, nameColumns.join(', '));

            // Busca pelos termos em todas as colunas de nome
            for (const term of searchTerms) {
              console.log(`\n   🔎 Buscando por "${term}"...`);
              
              const conditions = nameColumns.map(col => `${col} LIKE '%${term}%'`).join(' OR ');
              const searchQuery = `SELECT TOP 10 * FROM ${table} WHERE ${conditions}`;
              
              try {
                const results = await seniorService.executeQuery(searchQuery);
                
                if (results && results.length > 0) {
                  console.log(`   ✅ ENCONTRADO! ${results.length} registro(s):`);
                  results.forEach((row, idx) => {
                    console.log(`\n   Registro ${idx + 1}:`);
                    console.log('   ' + '-'.repeat(70));
                    Object.entries(row).forEach(([key, value]) => {
                      if (value !== null && value !== '') {
                        console.log(`   ${key}: ${value}`);
                      }
                    });
                  });
                } else {
                  console.log(`   ⚪ Nenhum resultado encontrado`);
                }
              } catch (searchError) {
                console.log(`   ⚠️  Erro ao buscar: ${searchError instanceof Error ? searchError.message : searchError}`);
              }
            }
          } else {
            console.log('   ⚠️  Nenhuma coluna de nome identificada');
            // Mostra um registro de exemplo
            console.log('\n   Exemplo de dados:');
            console.log('   ' + '-'.repeat(70));
            Object.entries(sampleData[0]).forEach(([key, value]) => {
              if (value !== null && value !== '') {
                console.log(`   ${key}: ${value}`);
              }
            });
          }
        } else {
          console.log('   ⚠️  Tabela vazia');
        }

      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid object name')) {
          console.log(`   ❌ Tabela não existe`);
        } else {
          console.log(`   ❌ Erro ao acessar tabela: ${error instanceof Error ? error.message : error}`);
        }
      }
    }

    console.log('\n\n' + '='.repeat(80));
    console.log('Busca concluída!');
    console.log('='.repeat(80));

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error during search:');
    console.error(error);
    process.exit(1);
  }
}

findClients();
