import { db } from '../server/db';
import { jobs, companies, clients, costCenters, workScales, users, kanbanBoards, jobStatuses } from '../shared/schema';

const jobTitles = [
  "Analista de Recursos Humanos",
  "Assistente Administrativo",
  "Coordenador de Vendas",
  "Gerente de Operações",
  "Analista Financeiro",
  "Supervisor de Produção",
  "Técnico de Manutenção",
  "Auxiliar de Logística",
  "Assistente Comercial",
  "Analista de Marketing"
];

const departments = [
  "Recursos Humanos",
  "Administrativo",
  "Comercial",
  "Operações",
  "Financeiro",
  "Produção",
  "Manutenção",
  "Logística",
  "Marketing"
];

const locations = [
  "São Paulo - SP",
  "Rio de Janeiro - RJ",
  "Belo Horizonte - MG",
  "Curitiba - PR",
  "Porto Alegre - RS",
  "Brasília - DF"
];

const descriptions = [
  "Responsável por executar atividades operacionais e administrativas da área, garantindo o cumprimento de processos e prazos estabelecidos.",
  "Atuar no suporte às atividades da área, prestando atendimento a clientes internos e externos, organizando documentos e controlando processos.",
  "Coordenar equipe e processos, garantindo o atingimento de metas e objetivos estratégicos da área.",
  "Gerenciar operações diárias, liderar equipe e implementar melhorias contínuas nos processos.",
  "Realizar análises financeiras, elaborar relatórios gerenciais e auxiliar na tomada de decisões estratégicas.",
  "Supervisionar atividades produtivas, garantir qualidade e produtividade, e liderar equipe operacional.",
  "Executar manutenção preventiva e corretiva de equipamentos, garantindo o funcionamento adequado dos sistemas.",
  "Auxiliar nas atividades de logística, controle de estoque e movimentação de materiais.",
  "Apoiar área comercial no relacionamento com clientes, elaboração de propostas e follow-up de vendas.",
  "Desenvolver e executar estratégias de marketing digital e offline, gerenciar campanhas e analisar resultados."
];

const requirements = [
  "Ensino Superior completo ou cursando. Experiência mínima de 2 anos na área. Conhecimento em Pacote Office.",
  "Ensino Médio completo. Experiência em rotinas administrativas. Conhecimento em sistemas de gestão.",
  "Superior completo em Administração ou áreas correlatas. Experiência em gestão de equipes e processos comerciais.",
  "Superior completo. Experiência em gestão operacional. Habilidades de liderança e planejamento estratégico.",
  "Superior em Ciências Contábeis, Administração ou Economia. Experiência em análise financeira e Excel avançado.",
  "Ensino Médio ou Técnico. Experiência em supervisão de produção. Conhecimento em indicadores de produtividade.",
  "Curso Técnico em áreas relacionadas. Experiência em manutenção de equipamentos industriais.",
  "Ensino Médio completo. Experiência em operações logísticas e controle de estoque.",
  "Superior cursando ou completo. Experiência em atendimento ao cliente e vendas. Boa comunicação.",
  "Superior em Marketing, Publicidade ou áreas afins. Experiência em marketing digital e redes sociais."
];

const specifications = [
  "Disponibilidade para trabalho presencial. Necessário ter veículo próprio.",
  "Horário comercial de segunda a sexta-feira. Vale transporte e vale refeição.",
  "Possibilidade de trabalho híbrido. Plano de saúde e odontológico.",
  "Regime CLT com benefícios completos. Oportunidade de crescimento profissional.",
  "Ambiente corporativo. Participação nos lucros e resultados.",
  "Turno de 8 horas. Uniforme e EPI's fornecidos pela empresa.",
  "Disponibilidade para viagens eventuais. Treinamentos técnicos oferecidos.",
  "Escala de trabalho conforme necessidade operacional. Refeitório no local.",
  "Home office parcial disponível. Bônus por atingimento de metas.",
  "Trabalho em equipe multidisciplinar. Ambiente criativo e inovador."
];

const workHours = [
  "08:00 às 17:00",
  "09:00 às 18:00",
  "08:00 às 18:00",
  "14:00 às 22:00",
  "Escala 5x2",
  "Escala 6x1"
];

async function createFakeJobs() {
  console.log('🚀 Iniciando criação de vagas fictícias...\n');

  try {
    // Buscar dados necessários
    const allCompanies = await db.select().from(companies);
    const allClients = await db.select().from(clients);
    const allCostCenters = await db.select().from(costCenters);
    const allWorkScales = await db.select().from(workScales);
    const allUsers = await db.select().from(users);
    const allKanbanBoards = await db.select().from(kanbanBoards);
    const allJobStatuses = await db.select().from(jobStatuses);

    if (allCompanies.length === 0) {
      console.log('❌ Nenhuma empresa encontrada. Crie empresas primeiro.');
      return;
    }

    if (allClients.length === 0) {
      console.log('❌ Nenhum cliente encontrado. Crie clientes primeiro.');
      return;
    }

    console.log(`✅ Encontradas ${allCompanies.length} empresas`);
    console.log(`✅ Encontrados ${allClients.length} clientes`);
    console.log(`✅ Encontrados ${allCostCenters.length} centros de custo`);
    console.log(`✅ Encontradas ${allWorkScales.length} escalas de trabalho`);
    console.log(`✅ Encontrados ${allUsers.length} usuários`);
    console.log(`✅ Encontrados ${allKanbanBoards.length} quadros kanban\n`);

    const statuses = allJobStatuses.length > 0 
      ? allJobStatuses.map(s => s.id) 
      : ['nova_vaga', 'em_andamento', 'aguardando_aprovacao'];

    // Criar 10 vagas
    for (let i = 0; i < 10; i++) {
      const company = allCompanies[Math.floor(Math.random() * allCompanies.length)];
      const client = allClients[Math.floor(Math.random() * allClients.length)];
      const costCenter = allCostCenters.length > 0 
        ? allCostCenters[Math.floor(Math.random() * allCostCenters.length)] 
        : null;
      const workScale = allWorkScales.length > 0
        ? allWorkScales[Math.floor(Math.random() * allWorkScales.length)]
        : null;
      const user = allUsers.length > 0
        ? allUsers[Math.floor(Math.random() * allUsers.length)]
        : null;
      const kanbanBoard = allKanbanBoards.length > 0
        ? allKanbanBoards[Math.floor(Math.random() * allKanbanBoards.length)]
        : null;

      const title = jobTitles[i];
      const department = departments[i % departments.length];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const description = descriptions[i];
      const requirement = requirements[i];
      const specification = specifications[i % specifications.length];
      const workHour = workHours[Math.floor(Math.random() * workHours.length)];
      
      // Código da vaga (ex: OPUS001, TELOS002, etc)
      const companyPrefix = company.name.substring(0, 4).toUpperCase();
      const jobCode = `${companyPrefix}${String(i + 1).padStart(3, '0')}`;

      // Datas
      const openingDate = new Date();
      openingDate.setDate(openingDate.getDate() - Math.floor(Math.random() * 30)); // Até 30 dias atrás
      
      const startDate = new Date(openingDate);
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 15) + 5); // 5-20 dias após abertura
      
      const slaDeadline = new Date(openingDate);
      slaDeadline.setDate(slaDeadline.getDate() + 14); // 14 dias após abertura

      // Salário
      const salaryMin = (2500 + Math.floor(Math.random() * 7500)).toFixed(2); // R$ 2.500 a R$ 10.000
      const bonus = Math.random() > 0.5 ? (500 + Math.floor(Math.random() * 2000)).toFixed(2) : null;

      const contractTypes = ['clt', 'pj', 'temporario', 'estagio'] as const;
      const jobTypes = ['produtiva', 'improdutiva'] as const;
      const openingReasons = ['substituicao', 'aumento_quadro'] as const;
      const genders = ['masculino', 'feminino', 'indiferente'] as const;
      const unhealthinessLevels = ['nao', '10', '20', '40'] as const;

      const jobData = {
        jobCode,
        title,
        description,
        requirements: requirement,
        specifications: specification,
        companyId: company.id,
        clientId: client.id,
        costCenterId: costCenter?.id || null,
        workPosition: title, // Mesmo que o título neste caso
        recruiterId: user?.id || null,
        createdBy: user?.id || null,
        department,
        location,
        contractType: contractTypes[Math.floor(Math.random() * contractTypes.length)],
        jobType: jobTypes[Math.floor(Math.random() * jobTypes.length)],
        openingDate,
        startDate,
        openingReason: openingReasons[Math.floor(Math.random() * openingReasons.length)],
        replacementEmployeeName: Math.random() > 0.5 ? 'João Silva' : null,
        ageRangeMin: 18 + Math.floor(Math.random() * 10),
        ageRangeMax: 45 + Math.floor(Math.random() * 15),
        vacancyQuantity: Math.floor(Math.random() * 3) + 1, // 1 a 3 vagas
        gender: genders[Math.floor(Math.random() * genders.length)],
        workScaleId: workScale?.id || null,
        workHours: workHour,
        salaryMin,
        bonus,
        hasHazardPay: Math.random() > 0.8,
        unhealthinessLevel: unhealthinessLevels[Math.floor(Math.random() * unhealthinessLevels.length)],
        kanbanBoardId: kanbanBoard?.id || null,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        slaDeadline,
        notes: `Vaga criada automaticamente para testes - ${new Date().toLocaleDateString('pt-BR')}`
      };

      const [createdJob] = await db.insert(jobs).values(jobData).returning();
      
      console.log(`✅ Vaga ${i + 1}/10 criada: ${jobCode} - ${title} (${company.name})`);
    }

    console.log('\n🎉 10 vagas fictícias criadas com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar vagas:', error);
    throw error;
  }
}

// Executar
createFakeJobs()
  .then(() => {
    console.log('\n✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro no script:', error);
    process.exit(1);
  });
