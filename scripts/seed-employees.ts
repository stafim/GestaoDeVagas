import { db } from "../server/db";
import { employees, companies } from "../shared/schema";

async function seedEmployees() {
  console.log("👨‍💼 Starting employees seeding...\n");

  // Get all companies
  const allCompanies = await db.select().from(companies);
  
  if (allCompanies.length === 0) {
    console.log("❌ No companies found. Please run seed-all-data.ts first.");
    process.exit(1);
  }

  console.log(`Found ${allCompanies.length} companies\n`);

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
  const employeeIds: string[] = [];
  
  for (let i = 0; i < allCompanies.length; i++) {
    const company = allCompanies[i];
    console.log(`Creating 10 employees for ${company.name}...`);
    
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
        companyId: company.id,
        department,
        position,
        isActive: true,
      }).returning();
      
      employeeIds.push(newEmployee.id);
      employeeCounter++;
    }
  }
  
  console.log(`\n✅ Created ${employeeIds.length} employees successfully!\n`);
}

seedEmployees()
  .then(() => {
    console.log("✨ Employee seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Employee seeding failed:", error);
    process.exit(1);
  });
