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
