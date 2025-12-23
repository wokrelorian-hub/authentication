import oracledb from 'oracledb';

// 1. Enable Thin Mode
try {
  if (oracledb.initOracleClient) {
    oracledb.initOracleClient({ libDir: '' });
  }
} catch {
  // Empty catch block is allowed
}

// 2. Define the connection function
// Renamed to getDbConnection to match standard conventions, but you can keep getOracleClient if you prefer
export async function getDbConnection() {
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
    connection = await getDbConnection();
    
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

// 4. NEW: Function to Delete User (Used by Webhook)
export async function deleteUserFromOracle(stytchUserId: string) {
  let connection;
  try {
    connection = await getDbConnection();
    
    // Execute the delete
    // Note: Ensure your table is named 'USERS' and column is 'USER_ID' (case sensitive in Oracle)
    const result = await connection.execute(
      `DELETE FROM USERS WHERE USER_ID = :id`,
      [stytchUserId], 
      { autoCommit: true }
    );

    console.log(`Deleted user ${stytchUserId}. Rows affected: ${result.rowsAffected}`);
    return result.rowsAffected;

  } catch (err) {
    console.error('Oracle Delete Error:', err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}