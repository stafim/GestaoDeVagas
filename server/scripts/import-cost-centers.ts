import { db } from '../db';
import { costCenters, companies, divisions } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

async function importCostCenters() {
  try {
    console.log('Starting cost centers import from Senior...\n');

    // Get Senior integration settings
    const settings = await db.query.seniorIntegrationSettings.findFirst({
      where: (settings, { eq }) => eq(settings.isActive, true),
    });

    if (!settings) {
      console.error('❌ Senior integration is not configured or active');
      process.exit(1);
    }

    console.log('✓ Senior integration settings found');
    console.log(`  API URL: ${settings.apiUrl}`);

    // Get all companies with seniorId
    const allCompanies = await db.select().from(companies);
    const companyMap = new Map<string, string>();
    
    allCompanies.forEach(company => {
      if (company.seniorId) {
        companyMap.set(company.seniorId, company.id);
      }
    });

    console.log(`✓ Found ${companyMap.size} companies with Senior ID mapping`);

    // Get all divisions with seniorCode
    const allDivisions = await db.select().from(divisions);
    const divisionMap = new Map<string, string>();
    
    allDivisions.forEach(division => {
      if (division.code) {
        divisionMap.set(division.code.toString(), division.id);
      }
    });

    console.log(`✓ Found ${divisionMap.size} divisions with code mapping\n`);

    // Query cost centers from Senior (including division)
    console.log('Fetching cost centers from Senior r018ccu table...');
    
    const queryResponse = await fetch(`${settings.apiUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
      },
      body: JSON.stringify({ 
        sqlText: 'SELECT numemp, codccu, nomccu, usu_coddiv FROM r018ccu ORDER BY numemp, codccu' 
      }),
    });

    if (!queryResponse.ok) {
      throw new Error(`Query failed: ${queryResponse.status} ${queryResponse.statusText}`);
    }

    const seniorCostCenters = await queryResponse.json();

    if (!Array.isArray(seniorCostCenters) || seniorCostCenters.length === 0) {
      console.log('⚠ No cost centers found in r018ccu table');
      return;
    }

    console.log(`✓ Found ${seniorCostCenters.length} cost centers in Senior\n`);

    // Get existing cost centers to avoid duplicates
    const existingCostCenters = await db.select().from(costCenters);
    const existingMap = new Set<string>();
    
    existingCostCenters.forEach(cc => {
      if (cc.seniorId && cc.companyId) {
        existingMap.add(`${cc.seniorId}-${cc.companyId}`);
      }
    });

    console.log(`✓ Found ${existingCostCenters.length} existing cost centers in database\n`);

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    let withDivision = 0;
    let withoutDivision = 0;

    console.log('Importing/updating cost centers...\n');

    for (const seniorCC of seniorCostCenters) {
      try {
        // Find the corresponding company in our system
        const companyId = companyMap.get(seniorCC.numemp.toString());
        
        if (!companyId) {
          if (errors < 5) {
            console.log(`⚠ Skipping ${seniorCC.codccu}: Company ${seniorCC.numemp} not found`);
          }
          skipped++;
          continue;
        }

        // Find division if usu_coddiv is set
        let divisionId: string | undefined = undefined;
        if (seniorCC.usu_coddiv && seniorCC.usu_coddiv !== 0) {
          divisionId = divisionMap.get(seniorCC.usu_coddiv.toString());
          if (divisionId) {
            withDivision++;
          }
        }

        if (!divisionId) {
          withoutDivision++;
        }

        // Check if already exists
        const key = `${seniorCC.codccu}-${companyId}`;
        const exists = existingMap.has(key);
        
        if (exists) {
          // Update existing cost center with division info
          await db.update(costCenters)
            .set({
              name: seniorCC.nomccu || `Centro de Custo ${seniorCC.codccu}`,
              divisionId: divisionId || null,
              lastSyncedAt: new Date(),
            })
            .where(and(
              eq(costCenters.seniorId, seniorCC.codccu),
              eq(costCenters.companyId, companyId)
            ));
          
          updated++;
        } else {
          // Insert new cost center
          await db.insert(costCenters).values({
            name: seniorCC.nomccu || `Centro de Custo ${seniorCC.codccu}`,
            code: seniorCC.codccu,
            companyId: companyId,
            divisionId: divisionId || null,
            seniorId: seniorCC.codccu,
            importedFromSenior: true,
            lastSyncedAt: new Date(),
          });
          
          imported++;
        }
        
        if ((imported + updated) % 100 === 0) {
          console.log(`  Processed ${imported + updated} cost centers...`);
        }

      } catch (error) {
        errors++;
        if (errors < 5) {
          console.error(`❌ Error importing ${seniorCC.codccu}:`, error instanceof Error ? error.message : error);
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Import completed!');
    console.log('='.repeat(50));
    console.log(`✓ Successfully imported (new): ${imported}`);
    console.log(`✓ Successfully updated (existing): ${updated}`);
    console.log(`  - With division: ${withDivision}`);
    console.log(`  - Without division: ${withoutDivision}`);
    console.log(`⚠ Skipped (no company mapping): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total processed: ${seniorCostCenters.length}`);
    console.log('='.repeat(50));

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error during import:');
    console.error(error);
    process.exit(1);
  }
}

importCostCenters();
