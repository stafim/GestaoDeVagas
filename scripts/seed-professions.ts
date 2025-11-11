import { db } from "../server/db";
import { professions } from "../shared/schema";

const professionCategories = {
  "Tecnologia": [
    "Desenvolvedor Full Stack", "Desenvolvedor Frontend", "Desenvolvedor Backend", "Desenvolvedor Mobile",
    "Analista de Sistemas", "Engenheiro de Software", "Arquiteto de Software", "DevOps Engineer",
    "Engenheiro de Dados", "Cientista de Dados", "Analista de BI", "DBA - Administrador de Banco de Dados",
    "Especialista em Cloud", "Especialista em Cibersegurança", "Analista de Segurança da Informação",
    "UX Designer", "UI Designer", "Product Designer", "Scrum Master", "Product Owner",
    "QA Tester", "Analista de QA", "Engenheiro de QA", "Especialista em Machine Learning",
    "Desenvolvedor de Jogos", "Desenvolvedor React", "Desenvolvedor Node.js", "Desenvolvedor Python"
  ],
  "Engenharia": [
    "Engenheiro Civil", "Engenheiro Mecânico", "Engenheiro Elétrico", "Engenheiro Eletrônico",
    "Engenheiro de Produção", "Engenheiro Químico", "Engenheiro Ambiental", "Engenheiro de Automação",
    "Engenheiro de Controle e Automação", "Engenheiro de Segurança do Trabalho", "Engenheiro de Qualidade",
    "Engenheiro de Processos", "Engenheiro de Manutenção", "Engenheiro de Projetos",
    "Engenheiro de Estruturas", "Engenheiro Sanitarista", "Engenheiro de Telecomunicações",
    "Engenheiro de Petróleo", "Engenheiro Naval", "Engenheiro Aeronáutico"
  ],
  "Saúde": [
    "Médico Clínico Geral", "Enfermeiro", "Técnico de Enfermagem", "Auxiliar de Enfermagem",
    "Fisioterapeuta", "Nutricionista", "Psicólogo", "Farmacêutico", "Dentista",
    "Médico do Trabalho", "Técnico de Segurança do Trabalho", "Fonoaudiólogo",
    "Terapeuta Ocupacional", "Radiologista", "Biomédico", "Técnico em Radiologia"
  ],
  "Administrativo": [
    "Assistente Administrativo", "Auxiliar Administrativo", "Analista Administrativo",
    "Coordenador Administrativo", "Gerente Administrativo", "Secretário Executivo",
    "Assistente de Diretoria", "Recepcionista", "Auxiliar de Escritório", "Office Boy",
    "Gerente de Operações", "Coordenador de Operações", "Analista de Processos"
  ],
  "Recursos Humanos": [
    "Analista de RH", "Assistente de RH", "Coordenador de RH", "Gerente de RH",
    "Diretor de RH", "Recrutador", "Analista de Recrutamento e Seleção", "Business Partner de RH",
    "Analista de Departamento Pessoal", "Analista de Remuneração e Benefícios",
    "Analista de Treinamento e Desenvolvimento", "Psicólogo Organizacional"
  ],
  "Finanças": [
    "Analista Financeiro", "Assistente Financeiro", "Coordenador Financeiro", "Gerente Financeiro",
    "Diretor Financeiro (CFO)", "Contador", "Assistente Contábil", "Analista Contábil",
    "Controller", "Analista de Contas a Pagar", "Analista de Contas a Receber",
    "Analista de Tesouraria", "Auditor", "Analista Fiscal", "Assistente Fiscal"
  ],
  "Vendas": [
    "Vendedor", "Consultor de Vendas", "Executivo de Vendas", "Representante Comercial",
    "Gerente de Vendas", "Diretor Comercial", "Coordenador de Vendas", "Supervisor de Vendas",
    "Analista Comercial", "Pré-Vendas", "Vendedor Interno", "Vendedor Externo",
    "Account Manager", "Key Account Manager", "Inside Sales"
  ],
  "Marketing": [
    "Analista de Marketing", "Assistente de Marketing", "Coordenador de Marketing",
    "Gerente de Marketing", "Diretor de Marketing", "Social Media", "Analista de Mídias Sociais",
    "Redator Publicitário", "Designer Gráfico", "Especialista em SEO", "Analista de Performance",
    "Coordenador de Marketing Digital", "Community Manager", "Brand Manager",
    "Analista de Comunicação", "Relações Públicas"
  ],
  "Facilities": [
    "Coordenador de Facilities", "Gerente de Facilities", "Supervisor de Facilities",
    "Técnico de Facilities", "Zelador", "Porteiro", "Recepcionista de Facilities",
    "Auxiliar de Limpeza", "Encarregado de Limpeza", "Jardineiro", "Eletricista Predial",
    "Encanador", "Técnico de HVAC", "Manobrista", "Controlador de Acesso"
  ],
  "Manutenção": [
    "Técnico de Manutenção", "Mecânico de Manutenção", "Eletricista de Manutenção",
    "Supervisor de Manutenção", "Coordenador de Manutenção", "Encarregado de Manutenção",
    "Mecânico Industrial", "Técnico Eletrônico", "Instrumentista", "Caldeireiro",
    "Soldador", "Torneiro Mecânico", "Ferramenteiro", "Lubrificador"
  ],
  "Indústria": [
    "Operador de Produção", "Auxiliar de Produção", "Supervisor de Produção",
    "Coordenador de Produção", "Gerente de Produção", "Operador de Máquinas",
    "Operador de Empilhadeira", "Conferente", "Almoxarife", "Assistente de Logística",
    "Analista de Logística", "Coordenador de Logística", "Técnico de Qualidade",
    "Inspetor de Qualidade", "Líder de Produção", "Montador", "Embalador"
  ],
  "Mobilidade": [
    "Motorista", "Motorista Executivo", "Motorista de Caminhão", "Motorista de Ônibus",
    "Motoboy", "Entregador", "Supervisor de Transportes", "Coordenador de Frota",
    "Analista de Frota", "Mecânico Automotivo", "Borracheiro", "Lavador de Veículos"
  ],
  "Educação": [
    "Professor", "Coordenador Pedagógico", "Diretor Escolar", "Orientador Educacional",
    "Instrutor de Treinamento", "Designer Instrucional", "Analista de Treinamento",
    "Auxiliar de Biblioteca", "Monitor Educacional"
  ],
  "Jurídico": [
    "Advogado", "Assistente Jurídico", "Analista Jurídico", "Coordenador Jurídico",
    "Gerente Jurídico", "Diretor Jurídico", "Paralegal", "Estagiário de Direito"
  ],
  "Compras": [
    "Comprador", "Assistente de Compras", "Analista de Compras", "Coordenador de Compras",
    "Gerente de Compras", "Diretor de Suprimentos", "Analista de Suprimentos"
  ],
  "Atendimento ao Cliente": [
    "Atendente", "Operador de SAC", "Analista de Atendimento", "Supervisor de Atendimento",
    "Coordenador de Atendimento", "Gerente de Customer Success", "Especialista em Customer Success"
  ]
};

const unions = [
  "Sindicato dos Metalúrgicos",
  "Sindicato dos Comerciários",
  "Sindicato dos Bancários",
  "Sindicato dos Químicos",
  "Sindicato dos Trabalhadores em Saúde",
  "Sindicato dos Engenheiros",
  "Sindicato dos Professores",
  "Sindicato dos Motoristas",
  "Sindicato dos Eletricitários",
  "Sindicato dos Trabalhadores em Tecnologia",
  null
];

async function seedProfessions() {
  console.log("🌱 Starting profession seeding...");
  
  // Buscar profissões existentes
  const existingProfessions = await db.select().from(professions);
  const existingNames = new Set(existingProfessions.map(p => p.name));
  
  console.log(`📊 Found ${existingProfessions.length} existing professions`);
  
  const professionsToInsert = [];
  let count = 0;
  let skipped = 0;
  
  for (const [category, professionList] of Object.entries(professionCategories)) {
    for (const professionName of professionList) {
      if (count >= 200) break;
      
      // Pular se já existe
      if (existingNames.has(professionName)) {
        skipped++;
        continue;
      }
      
      const union = unions[Math.floor(Math.random() * unions.length)];
      
      professionsToInsert.push({
        name: professionName,
        category: category,
        union: union,
        description: `Profissional de ${professionName} na área de ${category}`,
        isActive: true
      });
      
      count++;
    }
    if (count >= 200) break;
  }
  
  console.log(`⏭️  Skipped ${skipped} existing professions`);
  console.log(`📝 Inserting ${professionsToInsert.length} new professions...`);
  
  try {
    if (professionsToInsert.length > 0) {
      for (const profession of professionsToInsert) {
        await db.insert(professions).values(profession);
      }
      console.log(`✅ Successfully inserted ${professionsToInsert.length} professions!`);
    } else {
      console.log(`ℹ️  No new professions to insert`);
    }
    
    const result = await db.select().from(professions);
    console.log(`📊 Total professions in database: ${result.length}`);
  } catch (error) {
    console.error("❌ Error inserting professions:", error);
    throw error;
  }
}

seedProfessions()
  .then(() => {
    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });
