import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDocumentsByUser, getDocumentStats } from '@/lib/db';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statsOnly = searchParams.get('stats') === 'true';
    const userId = parseInt(session.user.id);

    if (statsOnly) {
      const stats = getDocumentStats(userId);
      return NextResponse.json({ stats });
    }

    const documents = getDocumentsByUser(userId);
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document history' },
      { status: 500 }
    );
  }
}
