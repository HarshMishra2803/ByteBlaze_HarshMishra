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
          const pdfModule = await import('pdf-parse');
          
          if (pdfModule.PDFParse) {
            // v2.x Class-based usage
            const parser = new pdfModule.PDFParse({ data: buffer });
            const pdfData = await parser.getText();
            text = pdfData.text;
            await parser.destroy();
          } else {
            // v1.x Function-based usage
            const pdfParse = pdfModule.default || pdfModule;
            if (typeof pdfParse !== 'function') {
              throw new Error('PDF parsing library could not be initialized correctly.');
            }
            const pdfData = await pdfParse(buffer);
            text = pdfData.text;
          }
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
    console.error('Compliance error path:', req.nextUrl.pathname);
    console.error('Error details:', error);
    return NextResponse.json(
      { error: `Compliance analysis failed: ${error.message || 'AI service is temporarily unavailable'}` },
      { status: 500 }
    );
  }
}
