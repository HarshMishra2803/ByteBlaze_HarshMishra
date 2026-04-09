import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateDocument as aiGenerateDocument } from '@/lib/ai';
import { saveDocument } from '@/lib/db';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, inputs, language } = await req.json();

    if (!type || !inputs) {
      return NextResponse.json(
        { error: 'Document type and inputs are required' },
        { status: 400 }
      );
    }

    const content = await aiGenerateDocument(type, inputs, language || 'en');

    const typeNames = {
      nda: 'Non-Disclosure Agreement',
      rental: 'Rental Agreement',
      employment: 'Employment Contract',
    };
    const title = typeNames[type] || 'Legal Document';

    // Save to database
    const result = saveDocument(
      parseInt(session.user.id),
      type,
      title,
      content,
      language || 'en'
    );

    return NextResponse.json({
      id: result.lastInsertRowid,
      title,
      type,
      content,
      language: language || 'en',
    });
  } catch (error) {
    console.error('Document generation error:', error);
    return NextResponse.json(
      { error: 'AI service is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
