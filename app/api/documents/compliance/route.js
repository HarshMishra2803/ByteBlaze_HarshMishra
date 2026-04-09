import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkCompliance as aiCompliance } from '@/lib/ai';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    let text = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');

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
    }

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: 'Please provide a document with at least 20 characters of text' },
        { status: 400 }
      );
    }

    const report = await aiCompliance(text);

    return NextResponse.json({ result: report });
  } catch (error) {
    console.error('Compliance check error:', error);
    return NextResponse.json(
      { error: 'AI service is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
