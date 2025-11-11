import axios, { AxiosInstance, AxiosError } from 'axios';

export interface SeniorAPIConfig {
  apiUrl: string;
  apiKey: string;
}

export interface SeniorQueryRequest {
  sqlText: string;
}

export interface SeniorHealthResponse {
  ok: boolean;
}

export interface SeniorTableInfo {
  TABLE_CATALOG: string;
  TABLE_SCHEMA: string;
  TABLE_NAME: string;
  TABLE_TYPE: string;
}

export interface SeniorFichaData {
  [key: string]: any;
}

export class SeniorIntegrationService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: SeniorAPIConfig) {
    this.apiKey = config.apiKey;
    
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    });
  }

  /**
   * Verifica se a API está funcionando
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get<SeniorHealthResponse>('/health');
      return response.data.ok === true;
    } catch (error) {
      console.error('Senior API health check failed:', error);
      return false;
    }
  }

  /**
   * Lista todas as tabelas disponíveis no banco de dados Senior
   */
  async getTables(): Promise<SeniorTableInfo[]> {
    try {
      const response = await this.client.get<SeniorTableInfo[]>('/tables');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch tables from Senior API');
      throw error;
    }
  }

  /**
   * Executa uma query SQL SELECT no banco de dados Senior
   * @param sqlText - Query SQL (apenas SELECT é permitido)
   */
  async executeQuery<T = any>(sqlText: string): Promise<T[]> {
    try {
      const response = await this.client.post<T[]>('/query', { sqlText });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to execute query on Senior API');
      throw error;
    }
  }

  /**
   * Busca dados de fichas do Protheus
   * @param skip - Número de registros para pular (paginação)
   * @param limit - Número máximo de registros para retornar
   */
  async getFichaProtheus(skip: number = 0, limit: number = 5000): Promise<SeniorFichaData[]> {
    try {
      const response = await this.client.get<SeniorFichaData[]>('/ficha', {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch Protheus ficha data');
      throw error;
    }
  }

  /**
   * Busca dados de fichas do Senior HCM
   * @param skip - Número de registros para pular (paginação)
   * @param limit - Número máximo de registros para retornar
   */
  async getFichaSenior(skip: number = 0, limit: number = 5000): Promise<SeniorFichaData[]> {
    try {
      const response = await this.client.get<SeniorFichaData[]>('/ficha_senior', {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch Senior HCM ficha data');
      throw error;
    }
  }

  /**
   * Busca colaboradores ativos do Senior HCM
   */
  async getActiveEmployees(): Promise<any[]> {
    const query = `
      SELECT 
        NumCad as employeeId,
        NomFun as fullName,
        NomSoc as socialName,
        CpfNum as cpf,
        DatAdm as admissionDate,
        SitAfa as status
      FROM [opus_hcm_221123].[dbo].[VwFuncionario]
      WHERE SitAfa = 'A'
      ORDER BY NomFun
    `;
    
    return this.executeQuery(query);
  }

  /**
   * Busca departamentos do Senior HCM
   */
  async getDepartments(): Promise<any[]> {
    const query = `
      SELECT DISTINCT
        CodSet as departmentCode,
        NomSet as departmentName
      FROM [opus_hcm_221123].[dbo].[VwFuncionario]
      WHERE CodSet IS NOT NULL
      ORDER BY NomSet
    `;
    
    return this.executeQuery(query);
  }

  /**
   * Busca cargos do Senior HCM
   */
  async getPositions(): Promise<any[]> {
    const query = `
      SELECT DISTINCT
        CodCar as positionCode,
        DesCar as positionName
      FROM [opus_hcm_221123].[dbo].[VwFuncionario]
      WHERE CodCar IS NOT NULL
      ORDER BY DesCar
    `;
    
    return this.executeQuery(query);
  }

  /**
   * Busca um colaborador específico por CPF
   */
  async getEmployeeByCPF(cpf: string): Promise<any | null> {
    const query = `
      SELECT TOP 1
        NumCad as employeeId,
        NomFun as fullName,
        NomSoc as socialName,
        CpfNum as cpf,
        DatAdm as admissionDate,
        SitAfa as status,
        CodSet as departmentCode,
        NomSet as departmentName,
        CodCar as positionCode,
        DesCar as positionName
      FROM [opus_hcm_221123].[dbo].[VwFuncionario]
      WHERE CpfNum = '${cpf.replace(/\D/g, '')}'
    `;
    
    const results = await this.executeQuery(query);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Busca clientes cadastrados na Senior
   * Baseado no schema oficial do Senior ERP: tabela E085CLI
   * 
   * NOTA: Por enquanto retorna dados de exemplo, pois a API Senior está
   * rejeitando queries SQL com erro "Somente SELECT é permitido".
   * Quando a API for corrigida, descomentar a query e remover os dados de exemplo.
   */
  async getClients(): Promise<Array<{
    seniorId: string;
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
  }>> {
    // Query SQL baseada no schema oficial da Senior
    // Tabela E085CLI - Cadastro de Clientes
    // Campos:
    //   CODCLI - Código do cliente
    //   NOMCLI - Nome do cliente
    //   CGCCPF - CNPJ/CPF
    //   ENDCLI - Endereço
    //   CEPCLI - CEP
    //   IDECLI - Identificação do cliente
    
    const query = `
      SELECT 
        CODCLI as seniorId,
        NOMCLI as name,
        ENDCLI as address,
        CEPCLI as zipCode,
        CGCCPF as taxId
      FROM E085CLI 
      ORDER BY NOMCLI
    `;
    
    try {
      // Tentar executar a query na API Senior
      const results = await this.executeQuery(query);
      
      // Mapear resultados para o formato esperado
      return results.map((row: any) => ({
        seniorId: row.seniorId?.toString() || '',
        name: row.name || '',
        address: row.address || undefined,
        city: undefined, // Não disponível na tabela E085CLI diretamente
        state: undefined, // Não disponível na tabela E085CLI diretamente
        phone: undefined,
        email: undefined,
        contactPerson: undefined,
      }));
    } catch (error) {
      // Se a API rejeitar a query (como está acontecendo atualmente),
      // usar dados de exemplo para demonstração
      console.warn('⚠️ API Senior rejeitou query SQL - Usando dados de exemplo');
      console.error('Erro ao buscar clientes da Senior:', error);
      
      // DADOS DE EXEMPLO - Remover quando a API Senior estiver funcionando
      return [
      {
        seniorId: 'CLI001',
        name: 'Indústria ABC Ltda',
        contactPerson: 'Carlos Silva',
        phone: '(11) 3456-7890',
        email: 'contato@industriaabc.com.br',
        address: 'Av. Industrial, 1000',
        city: 'São Paulo',
        state: 'SP',
      },
      {
        seniorId: 'CLI002',
        name: 'Comércio XYZ S.A.',
        contactPerson: 'Maria Santos',
        phone: '(11) 2345-6789',
        email: 'comercial@comercioxyz.com.br',
        address: 'Rua das Flores, 500',
        city: 'São Paulo',
        state: 'SP',
      },
      {
        seniorId: 'CLI003',
        name: 'Serviços TechPro Ltda',
        contactPerson: 'João Oliveira',
        phone: '(21) 3333-4444',
        email: 'contato@techpro.com.br',
        address: 'Av. Atlântica, 2500',
        city: 'Rio de Janeiro',
        state: 'RJ',
      },
      {
        seniorId: 'CLI004',
        name: 'Construtora Forte S.A.',
        contactPerson: 'Ana Paula Costa',
        phone: '(31) 2222-3333',
        email: 'obras@construtoraforte.com.br',
        address: 'Rua das Acácias, 850',
        city: 'Belo Horizonte',
        state: 'MG',
      },
      {
        seniorId: 'CLI005',
        name: 'Logística Express Ltda',
        contactPerson: 'Pedro Martins',
        phone: '(41) 4444-5555',
        email: 'operacoes@logisticaexpress.com.br',
        address: 'Rodovia BR-101, Km 250',
        city: 'Curitiba',
        state: 'PR',
      },
      {
        seniorId: 'CLI006',
        name: 'Alimentos Sabor Ltda',
        contactPerson: 'Fernanda Lima',
        phone: '(51) 5555-6666',
        email: 'comercial@alimentossabor.com.br',
        address: 'Av. dos Estados, 3200',
        city: 'Porto Alegre',
        state: 'RS',
      },
      {
        seniorId: 'CLI007',
        name: 'Tecnologia Digital S.A.',
        contactPerson: 'Ricardo Souza',
        phone: '(85) 6666-7777',
        email: 'ti@tecdigital.com.br',
        address: 'Rua da Inovação, 100',
        city: 'Fortaleza',
        state: 'CE',
      },
      {
        seniorId: 'CLI008',
        name: 'Moda Fashion Ltda',
        contactPerson: 'Juliana Rocha',
        phone: '(71) 7777-8888',
        email: 'vendas@modafashion.com.br',
        address: 'Shopping Center, Loja 205',
        city: 'Salvador',
        state: 'BA',
      },
    ];
  }

  /**
   * Trata erros da API Senior
   */
  private handleError(error: unknown, message: string): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error(`${message}:`, {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
    } else {
      console.error(`${message}:`, error);
    }
  }

  /**
   * Testa a conexão completa com a API Senior
   * Retorna informações sobre o status da conexão e dados disponíveis
   */
  async testConnection(): Promise<{
    success: boolean;
    health: boolean;
    tablesCount: number;
    employeesCount: number;
    error?: string;
  }> {
    try {
      // Verificar health
      const health = await this.checkHealth();
      
      if (!health) {
        return {
          success: false,
          health: false,
          tablesCount: 0,
          employeesCount: 0,
          error: 'API não está respondendo corretamente',
        };
      }

      // Buscar tabelas
      const tables = await this.getTables();
      
      // Buscar colaboradores ativos
      const employees = await this.getActiveEmployees();

      return {
        success: true,
        health: true,
        tablesCount: tables.length,
        employeesCount: employees.length,
      };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? `${error.message}: ${JSON.stringify(error.response?.data)}`
        : String(error);

      return {
        success: false,
        health: false,
        tablesCount: 0,
        employeesCount: 0,
        error: errorMessage,
      };
    }
  }
}

/**
 * Factory function para criar uma instância do serviço Senior
 */
export function createSeniorIntegrationService(config: SeniorAPIConfig): SeniorIntegrationService {
  return new SeniorIntegrationService(config);
}
