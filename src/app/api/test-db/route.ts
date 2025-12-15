import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/oracle';

export async function GET() {
  try {
    // COMMAND: Show me all users in the system!
    const result = await queryOne('SELECT * FROM users');
    
    // Extract rows safely
    const users = result && typeof result === 'object' && 'rows' in result 
      ? (result as { rows: unknown[] }).rows 
      : [];

    return NextResponse.json({ 
      success: true, 
      count: users.length, 
      users: users 
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}