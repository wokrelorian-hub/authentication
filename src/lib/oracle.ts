import oracledb from 'oracledb';

// 1. Enable Thin Mode
// We use a safe check to see if we need to init
try {
  if (oracledb.initOracleClient) {
    oracledb.initOracleClient({ libDir: '' });
  }
} catch {
  // Empty catch block is allowed if we don't use the error variable
}

// 2. Define the connection function
export async function getOracleClient() {
  if (!process.env.ORACLE_USER || !process.env.ORACLE_PASS || !process.env.ORACLE_CONN_STRING) {
    throw new Error('Oracle DB credentials missing in .env.local');
  }

  const connection = await oracledb.getConnection({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASS,
    connectString: process.env.ORACLE_CONN_STRING,
  });

  return connection;
}

// 3. Helper to run a query safely
export async function queryOne(sql: string, params: unknown[] = []) {
  let connection;
  try {
    connection = await getOracleClient();
    
    const result = await connection.execute(sql, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return JSON
      autoCommit: true,
    });
    
    return result;
  } catch (error) {
    console.error('Oracle Query Error:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
}