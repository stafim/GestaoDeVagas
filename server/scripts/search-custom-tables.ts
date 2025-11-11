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

async function searchCustomTables() {
  try {
    console.log('🔍 Buscando em tabelas customizadas (usu_*)...\n');

    const settings = await db.query.seniorIntegrationSettings.findFirst({
      where: eq(seniorIntegrationSettings.isActive, true),
    });

    if (!settings) {
      console.error('❌ Senior integration is not configured or active');
      process.exit(1);
    }

    const seniorService = createSeniorAPIService(settings.apiUrl, settings.apiKey);

    // Tabelas customizadas conhecidas
    const customTables = [
      'usu_tcliente',
      'usu_tcli',
      'usu_cliente',
      'usu_clientes',
      'usu_tcadcli',
      'usu_tclienteinfo',
    ];

    for (const tableName of customTables) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📋 Tabela: ${tableName}`);
      console.log('='.repeat(80));

      try {
        // Tenta buscar alguns registros
        const query = `SELECT TOP 20 * FROM ${tableName}`;
        const data = await seniorService.executeQuery(query);
        
        if (data && data.length > 0) {
          const columns = Object.keys(data[0]);
          console.log(`✅ Tabela encontrada! Total de registros de exemplo: ${data.length}`);
          console.log(`📊 Colunas (${columns.length}): ${columns.join(', ')}\n`);

          // Mostra todos os registros
          console.log('📄 Registros encontrados:\n');
          data.forEach((row, idx) => {
            console.log(`  ${idx + 1}. ${'-'.repeat(70)}`);
            Object.entries(row).forEach(([key, value]) => {
              if (value !== null && value !== '' && String(value).trim() !== '') {
                console.log(`     ${key}: ${value}`);
              }
            });
            console.log('');
          });

          // Busca especificamente por Localiza e Stellantis
          const nameColumns = columns.filter(col => 
            col.toLowerCase().includes('nom') || 
            col.toLowerCase().includes('raz') ||
            col.toLowerCase().includes('des') ||
            col.toLowerCase().includes('name')
          );

          if (nameColumns.length > 0) {
            console.log(`\n🔎 Buscando "Localiza" e "Stellantis" nas colunas: ${nameColumns.join(', ')}`);
            
            const conditions = nameColumns.map(col => 
              `${col} LIKE '%Localiza%' OR ${col} LIKE '%Stellantis%' OR ${col} LIKE '%Stelantis%'`
            ).join(' OR ');

            const searchQuery = `SELECT * FROM ${tableName} WHERE ${conditions}`;
            
            try {
              const results = await seniorService.executeQuery(searchQuery);
              
              if (results && results.length > 0) {
                console.log(`\n✅ ENCONTRADO! ${results.length} cliente(s):\n`);
                results.forEach((row, idx) => {
                  console.log(`  Cliente ${idx + 1}:`);
                  Object.entries(row).forEach(([key, value]) => {
                    if (value !== null && value !== '') {
                      console.log(`    ${key}: ${value}`);
                    }
                  });
                  console.log('');
                });
              } else {
                console.log(`  ⚪ Não encontrado nesta tabela`);
              }
            } catch (searchError) {
              console.log(`  ⚠️  Erro na busca: ${searchError instanceof Error ? searchError.message : searchError}`);
            }
          }

        } else {
          console.log('⚪ Tabela vazia');
        }

      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid object name')) {
          console.log(`❌ Tabela ${tableName} não existe`);
        } else {
          console.log(`❌ Erro: ${error instanceof Error ? error.message : error}`);
        }
      }
    }

    // Também busca o código 000003 que aparece em outccu
    console.log(`\n\n${'='.repeat(80)}`);
    console.log(`🔎 Análise do código outccu: 000003`);
    console.log('='.repeat(80));
    console.log('\nBuscando em r018ccu os outccu únicos...\n');
    
    try {
      const outccuQuery = `
        SELECT DISTINCT outccu, COUNT(*) as total 
        FROM r018ccu 
        WHERE outccu IS NOT NULL AND outccu != ''
        GROUP BY outccu 
        ORDER BY total DESC
      `;
      const outccuResults = await seniorService.executeQuery(outccuQuery);
      
      console.log('📊 Códigos outccu mais comuns:');
      outccuResults.slice(0, 20).forEach((row: any) => {
        console.log(`  ${row.outccu}: ${row.total} centros de custo`);
      });

    } catch (error) {
      console.log(`❌ Erro ao buscar outccu: ${error}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('Busca concluída!');
    console.log('='.repeat(80));

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error:');
    console.error(error);
    process.exit(1);
  }
}

searchCustomTables();
