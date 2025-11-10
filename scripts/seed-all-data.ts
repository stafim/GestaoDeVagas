import { db } from "../server/db";
import { 
  companies, 
  costCenters, 
  clients, 
  users, 
  workScales, 
  benefits, 
  jobs, 
  professions,
  employees 
} from "../shared/schema";
import bcrypt from "bcrypt";

async function seedAllData() {
  console.log("🌱 Starting complete database seeding...\n");

  // 1. Create Users (Recruiters)
  console.log("👥 Creating users...");
  const passwordHash = await bcrypt.hash("password123", 10);
  
  const userIds: string[] = [];
  const userEmails = [
    { email: "recruiter1@gestaovagas.com", firstName: "Ana", lastName: "Silva" },
    { email: "recruiter2@gestaovagas.com", firstName: "Carlos", lastName: "Santos" },
    { email: "recruiter3@gestaovagas.com", firstName: "Maria", lastName: "Oliveira" },
  ];

  for (const userData of userEmails) {
    const [user] = await db.insert(users).values({
      email: userData.email,
      passwordHash: passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: "recruiter",
    }).returning();
    userIds.push(user.id);
  }
  console.log(`✅ Created ${userIds.length} users\n`);

  // 2. Create Companies
  console.log("🏢 Creating companies...");
  const companyData = [
    { name: "Opus Facilities", color: "#3b82f6", industryType: "Facilities" },
    { name: "Telos Engenharia", color: "#10b981", industryType: "Engenharia" },
    { name: "Prime Tech Solutions", color: "#8b5cf6", industryType: "Tecnologia" },
    { name: "Global Logistics", color: "#f59e0b", industryType: "Logística" },
    { name: "Health Care Plus", color: "#ef4444", industryType: "Saúde" },
  ];

  const companyIds: string[] = [];
  for (const company of companyData) {
    const [newCompany] = await db.insert(companies).values(company).returning();
    companyIds.push(newCompany.id);
  }
  console.log(`✅ Created ${companyIds.length} companies\n`);

  // 3. Create Cost Centers
  console.log("💰 Creating cost centers...");
  const costCenterIds: string[] = [];
  
  for (let i = 0; i < companyIds.length; i++) {
    const companyId = companyIds[i];
    const centers = [
      { name: `Operações ${i + 1}`, code: `OP${i + 1}001`, companyId },
      { name: `Administrativo ${i + 1}`, code: `AD${i + 1}001`, companyId },
      { name: `Comercial ${i + 1}`, code: `CM${i + 1}001`, companyId },
    ];
    
    for (const center of centers) {
      const [newCenter] = await db.insert(costCenters).values(center).returning();
      costCenterIds.push(newCenter.id);
    }
  }
  console.log(`✅ Created ${costCenterIds.length} cost centers\n`);

  // 4. Create Employees (Funcionários)
  console.log("👨‍💼 Creating employees...");
  const employeeIds: string[] = [];
  
  const employeeNames = [
    "João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa", "Carlos Souza",
    "Juliana Lima", "Roberto Alves", "Fernanda Rocha", "Paulo Martins", "Beatriz Ferreira",
    "Ricardo Gomes", "Patricia Dias", "Marcos Pereira", "Luciana Barbosa", "André Ribeiro",
    "Camila Teixeira", "Felipe Carvalho", "Tatiana Araujo", "Diego Nascimento", "Renata Moreira",
    "Gabriel Freitas", "Amanda Cardoso", "Lucas Fernandes", "Larissa Ramos", "Bruno Castro",
    "Vanessa Melo", "Rodrigo Azevedo", "Carolina Mendes", "Thiago Correia", "Isabela Pinto",
    "Marcelo Barros", "Daniela Monteiro", "Leonardo Duarte", "Priscila Campos", "Rafael Cavalcanti",
    "Simone Vieira", "Gustavo Nunes", "Adriana Soares", "Vinicius Magalhães", "Cristina Rezende",
    "Eduardo Lopes", "Fabiana Torres", "Henrique Rodrigues", "Sandra Cunha", "Jorge Batista",
    "Rosana Pires", "Sérgio Moura", "Mônica Farias", "Alexandre Cruz", "Bruna Antunes"
  ];

  const employeeDepartments = ["Facilities", "Engenharia", "Manutenção", "Indústria", "Mobilidade", "Administrativo", "Comercial", "RH", "Financeiro"];
  const positions = [
    "Auxiliar de Serviços Gerais", "Técnico de Manutenção", "Assistente Administrativo", "Supervisor de Operações",
    "Coordenador de Facilities", "Analista de RH", "Motorista", "Eletricista", "Encarregado de Limpeza",
    "Recepcionista", "Assistente Comercial", "Auxiliar Técnico", "Zelador"
  ];

  let employeeCounter = 1000; // Começa em matrícula 1000
  
  for (let i = 0; i < companyIds.length; i++) {
    const companyId = companyIds[i];
    // Criar 10 funcionários por empresa
    for (let j = 0; j < 10; j++) {
      const employeeIndex = (i * 10) + j;
      const name = employeeNames[employeeIndex % employeeNames.length];
      const department = employeeDepartments[Math.floor(Math.random() * employeeDepartments.length)];
      const position = positions[Math.floor(Math.random() * positions.length)];
      const employeeCode = `MAT${employeeCounter}`;
      
      const [newEmployee] = await db.insert(employees).values({
        employeeCode,
        name,
        companyId,
        department,
        position,
        isActive: true,
      }).returning();
      
      employeeIds.push(newEmployee.id);
      employeeCounter++;
    }
  }
  console.log(`✅ Created ${employeeIds.length} employees\n`);

  // 5. Create Clients
  console.log("🤝 Creating clients...");
  const clientData = [
    { name: "Shopping Iguatemi", city: "São Paulo", state: "SP" },
    { name: "Hospital São Lucas", city: "Porto Alegre", state: "RS" },
    { name: "Aeroporto Internacional", city: "Rio de Janeiro", state: "RJ" },
    { name: "Universidade Federal", city: "Belo Horizonte", state: "MG" },
    { name: "Indústria Metalúrgica ABC", city: "São Bernardo", state: "SP" },
    { name: "Shopping Center Norte", city: "São Paulo", state: "SP" },
    { name: "Edifício Corporativo Prime", city: "Curitiba", state: "PR" },
    { name: "Fábrica TechParts", city: "Campinas", state: "SP" },
    { name: "Hotel Plaza Executive", city: "Brasília", state: "DF" },
    { name: "Condomínio Residencial Jardins", city: "Recife", state: "PE" },
  ];

  const clientIds: string[] = [];
  for (const client of clientData) {
    const [newClient] = await db.insert(clients).values(client).returning();
    clientIds.push(newClient.id);
  }
  console.log(`✅ Created ${clientIds.length} clients\n`);

  // 5. Create Work Scales
  console.log("⏰ Creating work scales...");
  const workScaleData = [
    { name: "5x1", description: "5 dias de trabalho, 1 de folga" },
    { name: "5x2", description: "5 dias de trabalho, 2 de folga" },
    { name: "6x1", description: "6 dias de trabalho, 1 de folga" },
    { name: "12x36", description: "12 horas de trabalho, 36 de descanso" },
    { name: "4x2", description: "4 dias de trabalho, 2 de folga" },
  ];

  const workScaleIds: string[] = [];
  for (const scale of workScaleData) {
    const [newScale] = await db.insert(workScales).values(scale).returning();
    workScaleIds.push(newScale.id);
  }
  console.log(`✅ Created ${workScaleIds.length} work scales\n`);

  // 6. Create Benefits
  console.log("🎁 Creating benefits...");
  const benefitData = [
    { name: "Vale Alimentação", description: "Auxílio alimentação mensal" },
    { name: "Vale Transporte", description: "Auxílio transporte" },
    { name: "Plano de Saúde", description: "Plano de saúde empresarial" },
    { name: "Plano Odontológico", description: "Plano odontológico" },
    { name: "Seguro de Vida", description: "Seguro de vida em grupo" },
    { name: "Vale Refeição", description: "Auxílio refeição" },
    { name: "Gympass", description: "Acesso a academias" },
    { name: "Day Off Aniversário", description: "Folga no dia do aniversário" },
  ];

  const benefitIds: string[] = [];
  for (const benefit of benefitData) {
    const [newBenefit] = await db.insert(benefits).values(benefit).returning();
    benefitIds.push(newBenefit.id);
  }
  console.log(`✅ Created ${benefitIds.length} benefits\n`);

  // 7. Get Professions
  console.log("👔 Fetching professions...");
  const allProfessions = await db.select().from(professions);
  console.log(`✅ Found ${allProfessions.length} professions\n`);

  // 8. Create 30 Jobs
  console.log("💼 Creating 30 job vacancies...\n");

  const departments = ["Facilities", "Engenharia", "Manutenção", "Indústria", "Mobilidade", "Administrativo"];
  const cities = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Porto Alegre", "Curitiba", "Brasília", "Recife", "Salvador", "Fortaleza"];
  const contractTypes = ["clt", "pj", "temporario", "estagio"] as const;
  const jobTypes = ["produtiva", "improdutiva"] as const;
  const genders = ["masculino", "feminino", "indiferente"] as const;
  const openingReasons = ["substituicao", "aumento_quadro"] as const;

  const jobsToCreate = [];
  
  for (let i = 0; i < 30; i++) {
    const profession = allProfessions[Math.floor(Math.random() * allProfessions.length)];
    const companyId = companyIds[Math.floor(Math.random() * companyIds.length)];
    const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
    const workScaleId = workScaleIds[Math.floor(Math.random() * workScaleIds.length)];
    const recruiterId = userIds[Math.floor(Math.random() * userIds.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    const location = cities[Math.floor(Math.random() * cities.length)];
    const contractType = contractTypes[Math.floor(Math.random() * contractTypes.length)];
    const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const openingReason = openingReasons[Math.floor(Math.random() * openingReasons.length)];
    const vacancyQuantity = openingReason === "substituicao" ? 1 : Math.floor(Math.random() * 5) + 1;
    
    const openingDate = new Date();
    const startDate = new Date(openingDate);
    startDate.setDate(startDate.getDate() + 14 + Math.floor(Math.random() * 30)); // 14-44 dias após abertura

    const salaries = [1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 8000, 10000];
    const salary = salaries[Math.floor(Math.random() * salaries.length)];

    jobsToCreate.push({
      professionId: profession.id,
      companyId,
      clientId,
      workScaleId,
      recruiterId,
      createdBy: recruiterId,
      department,
      location,
      contractType,
      jobType,
      gender,
      openingReason,
      vacancyQuantity,
      openingDate,
      startDate,
      ageRangeMin: 18 + Math.floor(Math.random() * 10),
      ageRangeMax: 45 + Math.floor(Math.random() * 20),
      workHours: "08:00 às 17:00",
      salaryMin: salary.toString(),
      description: `Vaga para ${profession.name} em ${location}. Empresa de ${department} busca profissional qualificado para integrar sua equipe.`,
      requirements: "Ensino médio completo, experiência na área, boa comunicação.",
      specifications: `Profissional de ${profession.name} para atuar em ${department}. Regime ${contractType}.`,
      status: ["aberto", "aprovada", "em_recrutamento"][Math.floor(Math.random() * 3)] as any,
      replacementEmployeeName: openingReason === "substituicao" ? "João Silva" : null,
    });
  }

  for (const job of jobsToCreate) {
    await db.insert(jobs).values(job);
  }

  console.log(`✅ Created ${jobsToCreate.length} job vacancies!\n`);

  // Final Summary
  const totalJobs = await db.select().from(jobs);
  console.log("📊 Summary:");
  console.log(`   - Users: ${userIds.length}`);
  console.log(`   - Companies: ${companyIds.length}`);
  console.log(`   - Cost Centers: ${costCenterIds.length}`);
  console.log(`   - Clients: ${clientIds.length}`);
  console.log(`   - Work Scales: ${workScaleIds.length}`);
  console.log(`   - Benefits: ${benefitIds.length}`);
  console.log(`   - Professions: ${allProfessions.length}`);
  console.log(`   - Jobs: ${totalJobs.length}`);
  console.log("\n🎉 Database seeding completed successfully!");
}

seedAllData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });
