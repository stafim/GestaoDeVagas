import { db } from "../server/db";
import { kanbanBoards, kanbanStages, jobs } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedKanban() {
  console.log("🎯 Starting Kanban board seeding...\n");

  // 1. Check if a kanban board already exists
  console.log("📋 Checking for existing kanban boards...");
  const existingBoards = await db.select().from(kanbanBoards);
  
  let boardId: string;
  
  if (existingBoards.length > 0) {
    console.log(`✅ Found existing board: "${existingBoards[0].name}"`);
    boardId = existingBoards[0].id;
    
    // Check if it has stages
    const existingStages = await db.select()
      .from(kanbanStages)
      .where(eq(kanbanStages.kanbanBoardId, boardId));
    
    if (existingStages.length > 0) {
      console.log(`ℹ️  Board already has ${existingStages.length} stages. Skipping stage creation.\n`);
      return;
    }
  } else {
    // Create a new default kanban board
    console.log("📝 Creating default kanban board...");
    const [newBoard] = await db.insert(kanbanBoards).values({
      name: "Processo de Recrutamento Padrão",
      description: "Pipeline padrão para gerenciamento de candidatos",
      isDefault: true,
    }).returning();
    
    boardId = newBoard.id;
    console.log(`✅ Created board: "${newBoard.name}"\n`);
  }

  // 2. Create standard recruitment stages
  console.log("📊 Creating kanban stages...");
  
  const stages = [
    { name: "Nova Candidatura", order: 1, color: "bg-blue-500" },
    { name: "Triagem", order: 2, color: "bg-purple-500" },
    { name: "Entrevista RH", order: 3, color: "bg-indigo-500" },
    { name: "Entrevista Técnica", order: 4, color: "bg-cyan-500" },
    { name: "Análise Final", order: 5, color: "bg-yellow-500" },
    { name: "Aprovado", order: 6, color: "bg-green-500" },
    { name: "Rejeitado", order: 7, color: "bg-red-500" },
  ];

  const createdStages = [];
  for (const stage of stages) {
    const [newStage] = await db.insert(kanbanStages).values({
      kanbanBoardId: boardId,
      name: stage.name,
      order: stage.order,
      color: stage.color,
    }).returning();
    
    createdStages.push(newStage);
    console.log(`  ✓ ${stage.name} (ordem ${stage.order})`);
  }
  
  console.log(`\n✅ Created ${createdStages.length} stages\n`);

  // 3. Associate all existing jobs with this kanban board
  console.log("🔗 Associating jobs to kanban board...");
  
  const allJobs = await db.select().from(jobs);
  let updatedCount = 0;
  
  for (const job of allJobs) {
    if (!job.kanbanBoardId) {
      await db.update(jobs)
        .set({ kanbanBoardId: boardId })
        .where(eq(jobs.id, job.id));
      updatedCount++;
    }
  }
  
  console.log(`✅ Associated ${updatedCount} jobs to the kanban board\n`);

  // Summary
  console.log("📊 Summary:");
  console.log(`   - Kanban Board ID: ${boardId}`);
  console.log(`   - Total Stages: ${createdStages.length}`);
  console.log(`   - Jobs Associated: ${updatedCount}`);
  console.log("\n🎉 Kanban setup completed successfully!");
}

seedKanban()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Kanban seeding failed:", error);
    process.exit(1);
  });
