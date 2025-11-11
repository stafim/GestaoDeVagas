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

async function findClientTables() {
  try {
    console.log('🔍 Buscando tabelas de clientes na Senior...\n');

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

    // Sabemos que o outccu é 000003 para Localiza e Stellantis
    // Vamos buscar tabelas que possam ter este código
    
    console.log('📊 Buscando código 000003 em várias tabelas...\n');

    const tablesToCheck = [
      { name: 'r070fil', desc: 'Filiais' },
      { name: 'r038cli', desc: 'Clientes diversos' },
      { name: 'r064cli', desc: 'Cadastro de clientes' },
      { name: 'e070fil', desc: 'Filiais' },
      { name: 'r038fun', desc: 'Funcionários' },
      { name: 'r020pss', desc: 'Pessoas' },
      { name: 'r014cli', desc: 'Clientes' },
      { name: 'r072cli', desc: 'Cadastro cliente/fornecedor' },
      { name: 'r026cli', desc: 'Clientes cadastro' },
    ];

    for (const table of tablesToCheck) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📋 Verificando: ${table.name} (${table.desc})`);
      console.log('='.repeat(80));

      try {
        // Primeiro, obtém a estrutura
        const structureQuery = `SELECT TOP 5 * FROM ${table.name}`;
        const sampleData = await seniorService.executeQuery(structureQuery);
        
        if (sampleData && sampleData.length > 0) {
          const columns = Object.keys(sampleData[0]);
          console.log(`✓ Tabela encontrada! Colunas (${columns.length}):`, columns.join(', '));

          // Procura por colunas que parecem códigos ou IDs
          const idColumns = columns.filter(col => 
            col.toLowerCase().includes('cod') || 
            col.toLowerCase().includes('num') ||
            col.toLowerCase().includes('id')
          );

          // Procura por colunas de nome
          const nameColumns = columns.filter(col => 
            col.toLowerCase().includes('nom') || 
            col.toLowerCase().includes('raz') ||
            col.toLowerCase().includes('des')
          );

          console.log(`\n📍 Colunas de ID: ${idColumns.join(', ')}`);
          console.log(`📍 Colunas de Nome: ${nameColumns.join(', ')}`);

          // Mostra alguns registros de exemplo
          console.log('\n📄 Exemplos de registros:');
          sampleData.slice(0, 3).forEach((row, idx) => {
            console.log(`\n  Registro ${idx + 1}:`);
            Object.entries(row).forEach(([key, value]) => {
              if (value !== null && value !== '' && String(value).trim() !== '') {
                console.log(`    ${key}: ${value}`);
              }
            });
          });

          // Busca por código "000003" ou "3"
          if (idColumns.length > 0) {
            console.log('\n🔎 Buscando código 000003 ou 3...');
            
            const conditions = [
              ...idColumns.map(col => `${col} = '000003'`),
              ...idColumns.map(col => `${col} = 3`),
            ].join(' OR ');
            
            const searchQuery = `SELECT TOP 10 * FROM ${table.name} WHERE ${conditions}`;
            
            try {
              const results = await seniorService.executeQuery(searchQuery);
              
              if (results && results.length > 0) {
                console.log(`\n✅ ENCONTRADO ${results.length} registro(s) com código 3 ou 000003:`);
                results.forEach((row, idx) => {
                  console.log(`\n  Match ${idx + 1}:`);
                  Object.entries(row).forEach(([key, value]) => {
                    if (value !== null && value !== '') {
                      console.log(`    ${key}: ${value}`);
                    }
                  });
                });
              }
            } catch (searchError) {
              // Ignora erros de busca
            }
          }

        } else {
          console.log('⚪ Tabela vazia');
        }

      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid object name')) {
          console.log(`❌ Tabela ${table.name} não existe`);
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

findClientTables();
