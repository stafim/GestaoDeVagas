import { db } from '../db';
import { workPositions } from '@shared/schema';

async function importWorkPositions() {
  try {
    console.log('='.repeat(80));
    console.log('IMPORTAÇÃO DE POSTOS DE TRABALHO DA TABELA r017pos DO SENIOR HCM');
    console.log('='.repeat(80) + '\n');

    // Get Senior integration settings
    const settings = await db.query.seniorIntegrationSettings.findFirst({
      where: (settings, { eq }) => eq(settings.isActive, true),
    });

    if (!settings) {
      console.error('❌ Integração Senior não está configurada ou ativa');
      process.exit(1);
    }

    console.log('✓ Configuração Senior encontrada');
    console.log(`  API URL: ${settings.apiUrl}\n`);

    // Query work positions from Senior r017pos table
    console.log('Buscando postos de trabalho da tabela r017pos...');
    
    const queryResponse = await fetch(`${settings.apiUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
      },
      body: JSON.stringify({ 
        sqlText: `
          SELECT 
            estpos,
            postra,
            despos,
            desred
          FROM r017pos 
          WHERE datext = '1900-12-31'  -- Apenas postos ativos
          ORDER BY estpos, postra
        `
      }),
    });

    if (!queryResponse.ok) {
      throw new Error(`Query falhou: ${queryResponse.status} ${queryResponse.statusText}`);
    }

    const seniorPositions = await queryResponse.json();

    if (!Array.isArray(seniorPositions) || seniorPositions.length === 0) {
      console.log('⚠ Nenhum posto de trabalho encontrado na tabela r017pos');
      return;
    }

    console.log(`✓ Encontrados ${seniorPositions.length} postos no Senior\n`);

    // Get existing positions to avoid duplicates
    const existingPositions = await db.query.workPositions.findMany();
    const existingMap = new Set<string>();
    
    existingPositions.forEach(pos => {
      if (pos.seniorEstablishment && pos.code) {
        existingMap.add(`${pos.seniorEstablishment}-${pos.code}`);
      }
    });

    console.log(`✓ Encontrados ${existingPositions.length} postos existentes no banco\n`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    console.log('Importando postos de trabalho...\n');

    for (const seniorPos of seniorPositions) {
      try {
        // Validate required fields
        if (!seniorPos.postra || !seniorPos.despos) {
          if (errors < 5) {
            console.log(`⚠ Pulando registro sem código ou descrição:`, seniorPos);
          }
          skipped++;
          continue;
        }

        // Check if already exists
        const key = `${seniorPos.estpos}-${seniorPos.postra}`;
        if (existingMap.has(key)) {
          skipped++;
          continue;
        }

        // Prepare work position data
        const code = String(seniorPos.postra).trim();
        const name = seniorPos.despos.trim();
        const shortName = seniorPos.desred ? seniorPos.desred.trim() : null;

        // Import work position
        await db.insert(workPositions).values({
          code: code,
          name: name,
          shortName: shortName,
          seniorEstablishment: String(seniorPos.estpos),
          importedFromSenior: true,
          lastSyncedAt: new Date(),
          isActive: true,
        });

        imported++;
        
        if (imported % 100 === 0) {
          console.log(`  Importados ${imported} postos...`);
        }

      } catch (error) {
        errors++;
        if (errors < 10) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          
          // Check if it's a unique constraint violation
          if (errorMsg.includes('unique') || errorMsg.includes('duplicate')) {
            skipped++;
            errors--; // Don't count as error, just skip
          } else {
            console.error(`❌ Erro ao importar ${seniorPos.postra}:`, errorMsg);
          }
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('IMPORTAÇÃO CONCLUÍDA!');
    console.log('='.repeat(80));
    console.log(`✓ Importados com sucesso: ${imported}`);
    console.log(`⚠ Pulados (já existem): ${skipped}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📊 Total processado: ${seniorPositions.length}`);
    console.log('='.repeat(80));

    // Show some examples
    if (imported > 0) {
      console.log('\n📝 Exemplos de postos importados:');
      console.log('-'.repeat(80));
      
      const samples = await db.query.workPositions.findMany({
        where: (p, { eq }) => eq(p.importedFromSenior, true),
        limit: 10,
      });
      
      samples.forEach((pos, idx) => {
        console.log(`${idx + 1}. Código: ${pos.code}`);
        console.log(`   Nome: ${pos.name}`);
        if (pos.shortName) console.log(`   Nome curto: ${pos.shortName}`);
        console.log(`   Estabelecimento: ${pos.seniorEstablishment}`);
        console.log('');
      });
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erro fatal durante importação:');
    console.error(error);
    process.exit(1);
  }
}

importWorkPositions();
