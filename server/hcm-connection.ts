import sql from 'mssql';

const config: sql.config = {
  server: process.env.MSSQL_SERVER || '',
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  user: process.env.MSSQL_USER || '',
  password: process.env.MSSQL_PASSWORD || '',
  database: process.env.MSSQL_DATABASE || '',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 30000,
  connectionTimeout: 30000,
};

let pool: sql.ConnectionPool | null = null;

export async function getHCMConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('Connected to HCM SQL Server');
  }
  return pool;
}

export async function closeHCMConnection(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('Closed HCM SQL Server connection');
  }
}

export interface WorkPosition {
  codigo: string;
  descricao: string;
  ativo: boolean;
}

export async function getWorkPositions(): Promise<WorkPosition[]> {
  try {
    const connection = await getHCMConnection();
    const result = await connection.request().query(`
      SELECT 
        codigo,
        descricao,
        ativo
      FROM PostoTrabalho
      WHERE ativo = 1
      ORDER BY descricao
    `);
    
    return result.recordset.map((record: any) => ({
      codigo: record.codigo,
      descricao: record.descricao,
      ativo: record.ativo,
    }));
  } catch (error) {
    console.error('Error fetching work positions from HCM:', error);
    throw new Error('Failed to fetch work positions from HCM');
  }
}
