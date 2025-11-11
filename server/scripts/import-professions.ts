import { db } from '../db';
import { professions } from '@shared/schema';

async function importProfessions() {
  try {
    console.log('='.repeat(80));
    console.log('IMPORTAÇÃO DE PROFISSÕES DA TABELA r024car DO SENIOR HCM');
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

    // Query professions from Senior r024car table
    console.log('Buscando cargos da tabela r024car...');
    
    const queryResponse = await fetch(`${settings.apiUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
      },
      body: JSON.stringify({ 
        sqlText: `
          SELECT 
            estcar,
            codcar,
            titcar,
            titred,
            COALESCE(codcbo, codcb2) as codcbo
          FROM r024car 
          ORDER BY estcar, codcar
        `
      }),
    });

    if (!queryResponse.ok) {
      throw new Error(`Query falhou: ${queryResponse.status} ${queryResponse.statusText}`);
    }

    const seniorProfessions = await queryResponse.json();

    if (!Array.isArray(seniorProfessions) || seniorProfessions.length === 0) {
      console.log('⚠ Nenhum cargo encontrado na tabela r024car');
      return;
    }

    console.log(`✓ Encontrados ${seniorProfessions.length} cargos no Senior\n`);

    // Get existing professions to avoid duplicates
    const existingProfessions = await db.select().from(professions);
    const existingMap = new Set<string>();
    
    existingProfessions.forEach(prof => {
      if (prof.seniorId && prof.seniorEstablishment) {
        existingMap.add(`${prof.seniorEstablishment}-${prof.seniorId}`);
      }
    });

    console.log(`✓ Encontradas ${existingProfessions.length} profissões existentes no banco\n`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    console.log('Importando profissões...\n');

    for (const seniorProf of seniorProfessions) {
      try {
        // Validate required fields
        if (!seniorProf.codcar || !seniorProf.titcar) {
          if (errors < 5) {
            console.log(`⚠ Pulando registro sem código ou título:`, seniorProf);
          }
          skipped++;
          continue;
        }

        // Check if already exists
        const key = `${seniorProf.estcar}-${seniorProf.codcar}`;
        if (existingMap.has(key)) {
          skipped++;
          continue;
        }

        // Prepare profession name (use full title)
        const professionName = seniorProf.titcar.trim();
        const description = seniorProf.titred ? seniorProf.titred.trim() : null;
        const cboCode = seniorProf.codcbo ? String(seniorProf.codcbo).trim() : null;

        // Import profession
        await db.insert(professions).values({
          name: professionName,
          description: description,
          cboCode: cboCode,
          seniorId: String(seniorProf.codcar),
          seniorEstablishment: String(seniorProf.estcar),
          importedFromSenior: true,
          lastSyncedAt: new Date(),
          isActive: true,
        });

        imported++;
        
        if (imported % 100 === 0) {
          console.log(`  Importadas ${imported} profissões...`);
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
            console.error(`❌ Erro ao importar ${seniorProf.codcar}:`, errorMsg);
          }
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('IMPORTAÇÃO CONCLUÍDA!');
    console.log('='.repeat(80));
    console.log(`✓ Importadas com sucesso: ${imported}`);
    console.log(`⚠ Puladas (já existem): ${skipped}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📊 Total processado: ${seniorProfessions.length}`);
    console.log('='.repeat(80));

    // Show some examples
    if (imported > 0) {
      console.log('\n📝 Exemplos de profissões importadas:');
      console.log('-'.repeat(80));
      
      const samples = await db.select()
        .from(professions)
        .where((professions, { eq }) => eq(professions.importedFromSenior, true))
        .limit(5);
      
      samples.forEach((prof, idx) => {
        console.log(`${idx + 1}. ${prof.name}`);
        if (prof.cboCode) console.log(`   CBO: ${prof.cboCode}`);
        if (prof.description) console.log(`   Descrição: ${prof.description}`);
        console.log(`   Senior ID: ${prof.seniorEstablishment}-${prof.seniorId}`);
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

importProfessions();
