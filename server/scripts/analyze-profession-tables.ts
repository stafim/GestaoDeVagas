import { db } from '../db';

async function analyzeProfessionTables() {
  try {
    const settings = await db.query.seniorIntegrationSettings.findFirst({
      where: (settings, { eq }) => eq(settings.isActive, true),
    });

    if (!settings) {
      console.error('❌ Senior integration not configured');
      process.exit(1);
    }

    console.log('='.repeat(80));
    console.log('ANÁLISE DETALHADA - TABELAS DE PROFISSÕES/CARGOS NO SENIOR');
    console.log('='.repeat(80) + '\n');

    // Tables to analyze in detail
    const tablesToAnalyze = [
      { name: 'r030car', description: 'Cargos (Tabela Principal)' },
      { name: 'r034fun', description: 'Funções/Colaboradores' },
      { name: 'r024cbo', description: 'CBO - Classificação Brasileira de Ocupações' },
      { name: 'r038pro', description: 'Profissões' },
      { name: 'r030pro', description: 'Profissões (r030)' },
    ];

    for (const table of tablesToAnalyze) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📋 ${table.name.toUpperCase()} - ${table.description}`);
      console.log('='.repeat(80));

      try {
        // Get table count
        const countResponse = await fetch(`${settings.apiUrl}/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': settings.apiKey,
          },
          body: JSON.stringify({
            sqlText: `SELECT COUNT(*) as total FROM ${table.name}`,
          }),
        });

        let totalRecords = 0;
        if (countResponse.ok) {
          const countData = await countResponse.json();
          totalRecords = countData[0]?.total || 0;
          console.log(`\n📊 Total de registros: ${totalRecords}`);
        }

        // Get sample records
        const sampleResponse = await fetch(`${settings.apiUrl}/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': settings.apiKey,
          },
          body: JSON.stringify({
            sqlText: `SELECT TOP 3 * FROM ${table.name}`,
          }),
        });

        if (sampleResponse.ok) {
          const samples = await sampleResponse.json();

          if (samples && samples.length > 0) {
            console.log(`\n📋 Estrutura da Tabela:`);
            console.log('-'.repeat(80));
            
            const fields = Object.keys(samples[0]);
            console.log(`   Total de campos: ${fields.length}`);
            console.log(`\n   Principais campos:`);
            
            // Show first 20 fields
            fields.slice(0, 20).forEach((field, idx) => {
              const sample = samples[0][field];
              const type = typeof sample;
              const value = sample !== null && sample !== '' ? String(sample).substring(0, 30) : '(vazio)';
              console.log(`      ${idx + 1}. ${field.padEnd(15)} - Tipo: ${type.padEnd(8)} - Exemplo: ${value}`);
            });

            if (fields.length > 20) {
              console.log(`      ... e mais ${fields.length - 20} campos`);
            }

            // Show samples with relevant fields only
            console.log(`\n📝 Exemplos de Registros (campos principais):`);
            console.log('-'.repeat(80));

            samples.forEach((record: any, idx: number) => {
              console.log(`\n   Registro ${idx + 1}:`);
              
              // Show only non-empty and relevant fields
              Object.entries(record).forEach(([key, value]) => {
                if (value !== null && value !== '') {
                  const strValue = String(value);
                  // Show fields that look important (shorter names, text content)
                  if (key.length <= 10 || strValue.length > 2) {
                    console.log(`      ${key}: ${strValue.substring(0, 60)}`);
                  }
                }
              });
            });

          } else {
            console.log('\n⚠ Nenhum registro encontrado');
          }
        } else {
          const errorText = await sampleResponse.text();
          console.log(`\n❌ Erro ao consultar: ${errorText.substring(0, 200)}`);
        }

      } catch (err) {
        console.log(`\n❌ Erro ao processar tabela: ${err instanceof Error ? err.message : err}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('RESUMO DAS TABELAS ENCONTRADAS');
    console.log('='.repeat(80));
    console.log(`
Tabelas mais relevantes para importação de profissões:

1. r030car - Cargos (Tabela Principal de Cargos)
2. r024cbo - CBO (Classificação Brasileira de Ocupações)  
3. r038pro - Profissões
4. r030pro - Profissões (outra tabela)
5. r034fun - Funções/Colaboradores (contém cargo do colaborador)

Recomendação: Começar pela tabela r030car ou r024cbo, pois são as
tabelas padrão do Senior HCM para cadastro de cargos/profissões.
`);
    console.log('='.repeat(80));

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  }
}

analyzeProfessionTables();
