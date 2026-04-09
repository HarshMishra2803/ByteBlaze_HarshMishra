import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { explainClause as aiExplain } from '@/lib/ai';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clause, language } = await req.json();

    if (!clause || clause.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a clause with at least 10 characters' },
        { status: 400 }
      );
    }

    const explanation = await aiExplain(clause, language || 'en');

    return NextResponse.json({ result: explanation });
  } catch (error) {
    console.error('Clause explanation error:', error);
    return NextResponse.json(
      { error: 'AI service is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
