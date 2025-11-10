import { InsertClient } from '../shared/schema';

const API_URL = 'http://localhost:5000';

const clients: InsertClient[] = [
  {
    name: 'Localiza',
    contactPerson: 'Roberto Martins',
    phone: '(11) 3000-1000',
    email: 'contato@localiza.com',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    notes: 'Empresa de aluguel de veículos',
    maxJobs: 50,
    isActive: true,
  },
  {
    name: 'Unidas',
    contactPerson: 'Fernanda Lima',
    phone: '(11) 3000-2000',
    email: 'contato@unidas.com.br',
    address: 'Av. Brigadeiro Faria Lima, 2000',
    city: 'São Paulo',
    state: 'SP',
    notes: 'Locadora de veículos',
    maxJobs: 40,
    isActive: true,
  },
  {
    name: 'Stellantis',
    contactPerson: 'Marco Antonio',
    phone: '(11) 3000-3000',
    email: 'rh@stellantis.com',
    address: 'Rodovia Anhanguera, km 100',
    city: 'Betim',
    state: 'MG',
    notes: 'Montadora de veículos (Fiat, Jeep, Peugeot, Citroën)',
    maxJobs: 100,
    isActive: true,
  },
  {
    name: 'Volkswagen',
    contactPerson: 'Cristina Souza',
    phone: '(11) 3000-4000',
    email: 'recrutamento@vw.com.br',
    address: 'Via Anchieta, km 23,5',
    city: 'São Bernardo do Campo',
    state: 'SP',
    notes: 'Montadora de veículos',
    maxJobs: 120,
    isActive: true,
  },
  {
    name: 'Movida',
    contactPerson: 'Lucas Oliveira',
    phone: '(11) 3000-5000',
    email: 'parceiros@movida.com.br',
    address: 'Av. das Nações Unidas, 12901',
    city: 'São Paulo',
    state: 'SP',
    notes: 'Locadora de veículos e gestão de frotas',
    maxJobs: 45,
    isActive: true,
  },
  {
    name: 'Mercado Livre',
    contactPerson: 'Patricia Santos',
    phone: '(11) 3000-6000',
    email: 'talentos@mercadolivre.com',
    address: 'Av. das Nações Unidas, 3003',
    city: 'São Paulo',
    state: 'SP',
    notes: 'E-commerce e marketplace',
    maxJobs: 80,
    isActive: true,
  },
];

async function createClients() {
  console.log('Criando 6 clientes...\n');
  
  for (const client of clients) {
    try {
      const response = await fetch(`${API_URL}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
      });

      if (response.ok) {
        const created = await response.json();
        console.log(`✓ ${client.name} criado com sucesso (ID: ${created.id})`);
      } else {
        const error = await response.text();
        console.error(`✗ Erro ao criar ${client.name}: ${error}`);
      }
    } catch (error) {
      console.error(`✗ Erro ao criar ${client.name}:`, error);
    }
  }
  
  console.log('\nProcesso concluído!');
}

createClients();
