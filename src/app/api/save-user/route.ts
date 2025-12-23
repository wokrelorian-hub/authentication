import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/oracle';

// This tells Cloudflare to use the Edge Runtime
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, userID, fullName } = body; // 1. Accept fullName

    if (!email || !userID) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Check existence
    const checkSql = `SELECT user_id FROM users WHERE email = :email`;
    const checkResult = await queryOne(checkSql, [email]) as { rows: unknown[] };
    
    const rows = checkResult?.rows || [];

    if (rows.length === 0) {
      // 2. Insert with Full Name
      // We use (NVL or similar logic isn't needed if we pass empty string, but let's be clean)
      const insertSql = `
        INSERT INTO users (user_id, email, full_name, role) 
        VALUES (:id, :email, :name, 'user')
      `;
      // Pass the fullName (or 'User' if missing)
      await queryOne(insertSql, [userID, email, fullName || 'User']);
      
      return NextResponse.json({ success: true, message: 'User created' });
    }

    return NextResponse.json({ success: true, message: 'User already exists' });

  } catch (error: unknown) {
    console.error('Save User Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}