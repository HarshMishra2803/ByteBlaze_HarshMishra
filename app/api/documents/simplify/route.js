import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { simplifyDocument as aiSimplify } from '@/lib/ai';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    let text = '';
    let language = 'en';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      language = formData.get('language') || 'en';

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        
        if (file.name.endsWith('.pdf')) {
          const pdfParse = (await import('pdf-parse')).default;
          const pdfData = await pdfParse(buffer);
          text = pdfData.text;
        } else {
          text = buffer.toString('utf-8');
        }
      }
    } else {
      const body = await req.json();
      text = body.text;
      language = body.language || 'en';
    }

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: 'Please provide a document with at least 20 characters of text' },
        { status: 400 }
      );
    }

    const simplified = await aiSimplify(text, language);

    return NextResponse.json({ result: simplified });
  } catch (error) {
    console.error('Simplification error:', error);
    return NextResponse.json(
      { error: 'AI service is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
