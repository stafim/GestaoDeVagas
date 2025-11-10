import { InsertClientEmployee } from '../shared/schema';

const API_URL = 'http://localhost:5000';

const clientEmployees: { clientId: string; clientName: string; employees: Omit<InsertClientEmployee, 'clientId'>[] }[] = [
  {
    clientId: 'e154cbae-1a0a-45f3-a633-1a2488b684e5',
    clientName: 'Localiza',
    employees: [
      {
        name: 'Carlos Silva',
        position: 'Gerente de Frota',
        status: 'ativo' as const,
        admissionDate: '2022-01-15',
      },
      {
        name: 'Ana Paula Costa',
        position: 'Supervisora de Operações',
        status: 'ativo' as const,
        admissionDate: '2022-03-20',
      },
      {
        name: 'Roberto Santos',
        position: 'Coordenador de Logística',
        status: 'ativo' as const,
        admissionDate: '2023-05-10',
      },
      {
        name: 'Juliana Oliveira',
        position: 'Analista de Manutenção',
        status: 'ativo' as const,
        admissionDate: '2023-08-22',
      },
    ]
  },
  {
    clientId: 'dc8f807a-080b-415d-a1f4-333bc2cd4006',
    clientName: 'Unidas',
    employees: [
      {
        name: 'Fernando Lima',
        position: 'Gerente Regional',
        status: 'ativo' as const,
        admissionDate: '2021-06-01',
      },
      {
        name: 'Patricia Rocha',
        position: 'Coordenadora Comercial',
        status: 'ativo' as const,
        admissionDate: '2022-02-14',
      },
      {
        name: 'Marcos Ferreira',
        position: 'Supervisor de Atendimento',
        status: 'ativo' as const,
        admissionDate: '2023-01-10',
      },
    ]
  },
  {
    clientId: 'd39546d4-ae12-48f6-be47-448ededb92d6',
    clientName: 'Stellantis',
    employees: [
      {
        name: 'Marco Antonio Ribeiro',
        position: 'Gerente de Produção',
        status: 'ativo' as const,
        admissionDate: '2020-03-01',
      },
      {
        name: 'Cristina Almeida',
        position: 'Engenheira de Manufatura',
        status: 'ativo' as const,
        admissionDate: '2021-07-15',
      },
      {
        name: 'José Carlos Martins',
        position: 'Supervisor de Qualidade',
        status: 'ativo' as const,
        admissionDate: '2022-04-20',
      },
      {
        name: 'Sandra Mendes',
        position: 'Coordenadora de RH',
        status: 'ativo' as const,
        admissionDate: '2022-09-10',
      },
      {
        name: 'Eduardo Nascimento',
        position: 'Analista de Processos',
        status: 'ativo' as const,
        admissionDate: '2023-02-28',
      },
    ]
  },
  {
    clientId: '9aa92a0a-b18a-4c4e-bfa7-23f1ad85ed3f',
    clientName: 'Volkswagen',
    employees: [
      {
        name: 'Cristina Souza',
        position: 'Gerente de Recrutamento',
        status: 'ativo' as const,
        admissionDate: '2019-11-05',
      },
      {
        name: 'André Barbosa',
        position: 'Coordenador de Engenharia',
        status: 'ativo' as const,
        admissionDate: '2021-01-20',
      },
      {
        name: 'Beatriz Cardoso',
        position: 'Supervisora de Montagem',
        status: 'ativo' as const,
        admissionDate: '2022-06-12',
      },
      {
        name: 'Rafael Nunes',
        position: 'Analista de Logística',
        status: 'ativo' as const,
        admissionDate: '2023-03-08',
      },
    ]
  },
  {
    clientId: '9659225f-f247-4d88-803a-fa09396e217b',
    clientName: 'Movida',
    employees: [
      {
        name: 'Lucas Oliveira',
        position: 'Gerente de Frota',
        status: 'ativo' as const,
        admissionDate: '2022-02-10',
      },
      {
        name: 'Mariana Santos',
        position: 'Coordenadora Financeira',
        status: 'ativo' as const,
        admissionDate: '2022-07-18',
      },
      {
        name: 'Thiago Pereira',
        position: 'Supervisor de Operações',
        status: 'ativo' as const,
        admissionDate: '2023-04-05',
      },
    ]
  },
  {
    clientId: 'f8e606ce-e893-440c-ac85-620a965ccd7c',
    clientName: 'Mercado Livre',
    employees: [
      {
        name: 'Patricia Santos',
        position: 'Gerente de Talentos',
        status: 'ativo' as const,
        admissionDate: '2020-08-15',
      },
      {
        name: 'Gabriel Costa',
        position: 'Coordenador de TI',
        status: 'ativo' as const,
        admissionDate: '2021-04-22',
      },
      {
        name: 'Fernanda Dias',
        position: 'Supervisora de Logística',
        status: 'ativo' as const,
        admissionDate: '2022-01-30',
      },
      {
        name: 'Bruno Carvalho',
        position: 'Analista de Dados',
        status: 'ativo' as const,
        admissionDate: '2022-11-10',
      },
      {
        name: 'Camila Torres',
        position: 'Coordenadora de Marketing',
        status: 'ativo' as const,
        admissionDate: '2023-06-20',
      },
    ]
  },
];

async function createClientEmployees() {
  console.log('Criando funcionários para cada cliente...\n');
  
  let totalCreated = 0;
  
  for (const { clientId, clientName, employees } of clientEmployees) {
    console.log(`Cliente: ${clientName}`);
    
    for (const employee of employees) {
      try {
        const response = await fetch(`${API_URL}/api/client-employees`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...employee, clientId }),
        });

        if (response.ok) {
          const created = await response.json();
          console.log(`  ✓ ${employee.name} - ${employee.position}`);
          totalCreated++;
        } else {
          const error = await response.text();
          console.error(`  ✗ Erro ao criar ${employee.name}: ${error}`);
        }
      } catch (error) {
        console.error(`  ✗ Erro ao criar ${employee.name}:`, error);
      }
    }
    console.log('');
  }
  
  console.log(`\nProcesso concluído! ${totalCreated} funcionários criados.`);
}

createClientEmployees();
