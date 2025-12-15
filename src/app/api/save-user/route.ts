import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/oracle';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, userID } = body; 

    if (!email || !userID) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // 1. Check if they exist first (Safety Check)
    const checkSql = `SELECT user_id FROM users WHERE email = :email`;
    const checkResult = await queryOne(checkSql, [email]);
    
    const rows = checkResult && typeof checkResult === 'object' && 'rows' in checkResult 
      ? (checkResult as { rows: unknown[] }).rows 
      : [];

    if (rows.length === 0) {
      // 2. User is new! Insert them into Oracle.
      const insertSql = `
        INSERT INTO users (user_id, email, role) 
        VALUES (:id, :email, 'user')
      `;
      await queryOne(insertSql, [userID, email]);
      return NextResponse.json({ success: true, message: 'User created in Oracle' });
    }

    return NextResponse.json({ success: true, message: 'User already exists' });

  } catch (error: unknown) {
    console.error('Save User Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}