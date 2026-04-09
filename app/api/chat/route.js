import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { chatResponse as aiChat } from '@/lib/ai';
import { saveChatMessage, getChatHistory, clearChatHistory } from '@/lib/db';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, action } = await req.json();
    const userId = parseInt(session.user.id);

    // Clear chat history
    if (action === 'clear') {
      clearChatHistory(userId);
      return NextResponse.json({ message: 'Chat history cleared' });
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a message' },
        { status: 400 }
      );
    }

    // Save user message
    saveChatMessage(userId, 'user', message);

    // Get chat history for context
    const history = getChatHistory(userId);
    const messages = history.map(h => ({
      role: h.role,
      content: h.message,
    }));

    // Get AI response
    const response = await aiChat(messages);

    // Save AI response
    saveChatMessage(userId, 'assistant', response);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'AI service is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const history = getChatHistory(parseInt(session.user.id));
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Chat history fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}
