import { InsertCompany } from '../shared/schema';

const API_URL = 'http://localhost:5000';

const companies: Omit<InsertCompany, 'jobCounter'>[] = [
  {
    name: 'Opus Consultoria',
    cnpj: '12.345.678/0001-01',
    contactPerson: 'João Silva',
    phone: '(11) 98765-4321',
    email: 'contato@opusconsultoria.com.br',
    industryType: 'Consultoria',
    description: 'Empresa especializada em consultoria empresarial e gestão',
    website: 'https://opusconsultoria.com.br',
    color: '#3b82f6',
  },
  {
    name: 'Opus Logistica',
    cnpj: '23.456.789/0001-02',
    contactPerson: 'Maria Santos',
    phone: '(11) 98765-4322',
    email: 'contato@opuslogistica.com.br',
    industryType: 'Logística',
    description: 'Soluções completas em logística e transporte',
    website: 'https://opuslogistica.com.br',
    color: '#10b981',
  },
  {
    name: 'Acelera IT',
    cnpj: '34.567.890/0001-03',
    contactPerson: 'Carlos Oliveira',
    phone: '(11) 98765-4323',
    email: 'contato@acelerait.com.br',
    industryType: 'Tecnologia',
    description: 'Desenvolvimento de software e soluções tecnológicas',
    website: 'https://acelerait.com.br',
    color: '#8b5cf6',
  },
  {
    name: 'Opus Serviços',
    cnpj: '45.678.901/0001-04',
    contactPerson: 'Ana Costa',
    phone: '(11) 98765-4324',
    email: 'contato@opusservicos.com.br',
    industryType: 'Serviços',
    description: 'Prestação de serviços gerais e facilities',
    website: 'https://opusservicos.com.br',
    color: '#f59e0b',
  },
  {
    name: 'Telos Consultoria',
    cnpj: '56.789.012/0001-05',
    contactPerson: 'Pedro Almeida',
    phone: '(11) 98765-4325',
    email: 'contato@telosconsultoria.com.br',
    industryType: 'Consultoria',
    description: 'Consultoria estratégica e transformação digital',
    website: 'https://telosconsultoria.com.br',
    color: '#ec4899',
  },
];

async function createCompanies() {
  console.log('Criando 5 empresas...\n');
  
  for (const company of companies) {
    try {
      const response = await fetch(`${API_URL}/api/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(company),
      });

      if (response.ok) {
        const created = await response.json();
        console.log(`✓ ${company.name} criada com sucesso (ID: ${created.id})`);
      } else {
        const error = await response.text();
        console.error(`✗ Erro ao criar ${company.name}: ${error}`);
      }
    } catch (error) {
      console.error(`✗ Erro ao criar ${company.name}:`, error);
    }
  }
  
  console.log('\nProcesso concluído!');
}

createCompanies();
