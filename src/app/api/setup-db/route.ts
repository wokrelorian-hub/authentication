import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/oracle';

export async function GET() {
  try {
    // SQL: Create the USERS table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR2(100) PRIMARY KEY,
        email VARCHAR2(255) NOT NULL,
        full_name VARCHAR2(100),
        role VARCHAR2(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Execute the command
    // Note: 'IF NOT EXISTS' is supported in Oracle 23ai. 
    // If you are on an older version and this fails, we will use a different trick.
    await queryOne(createTableSQL);

    return NextResponse.json({ 
      success: true, 
      message: 'Database Setup Complete: USERS table created.' 
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown Error';
    
    // Handle "Name already used" error (ORA-00955) gracefully
    if (msg.includes('ORA-00955')) {
      return NextResponse.json({ success: true, message: 'Table already exists. Good to go!' });
    }

    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}