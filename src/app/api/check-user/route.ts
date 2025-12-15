import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/oracle';

// 1. Define a strict type for our DB result
interface UserRow {
  USER_ID: string;
  FULL_NAME?: string;
  full_name?: string; // Handle case-sensitivity
}

interface OracleResult {
  rows: UserRow[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 2. Fetch full_name along with user_id
    const sql = `SELECT user_id, full_name FROM users WHERE email = :email`;
    const params = [email];

    const result = await queryOne(sql, params) as OracleResult; // Type Assertion

    // 3. Safe check using our Interface
    const rows = result && result.rows ? result.rows : [];

    if (rows.length > 0) {
      const user = rows[0];
      return NextResponse.json({ 
        exists: true, 
        // Oracle column names can be uppercase
        name: user.FULL_NAME || user.full_name || '' 
      });
    }

    return NextResponse.json({ exists: false });

  } catch (error: unknown) {
    console.error('Check User Error:', error);
    return NextResponse.json({ exists: false, error: 'Database error' }, { status: 500 });
  }
}