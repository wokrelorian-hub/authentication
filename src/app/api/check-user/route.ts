import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/oracle';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // SQL: Check if a user with this email exists in our USERS table
    // We use :email to safely prevent SQL Injection (Security Best Practice)
    const sql = `SELECT user_id FROM users WHERE email = :email`;
    const params = [email];

    const result = await queryOne(sql, params);

    // Check if we found any rows
    // In our helper, result.rows is the array of data
    const rows = result && typeof result === 'object' && 'rows' in result 
      ? (result as { rows: unknown[] }).rows 
      : [];

    const userExists = rows.length > 0;

    return NextResponse.json({ exists: userExists });

  } catch (error: unknown) {
    console.error('Check User Error:', error);
    return NextResponse.json({ exists: false, error: 'Database error' }, { status: 500 });
  }
}