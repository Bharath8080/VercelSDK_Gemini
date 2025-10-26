// app/api/chat/route.ts
import { google } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // streamText returns a streaming response suitable for the AI SDK frontend hooks
  const result = streamText({
    model: google('gemini-2.5-flash'), // or 'gemini-2.5-pro' for stronger reasoning
    messages: convertToModelMessages(messages),
    
    // Add Google Search tool
    tools: {
      google_search: google.tools.googleSearch({}),
    },
    
    // Optional: provider-specific options
    providerOptions: {
      google: {
        // Example thinking config (controls Gemini's internal "thinking" budget)
        thinkingConfig: {
          thinkingBudget: 4096,
          includeThoughts: false,
        },
      },
    },
  });

  // Convert AI SDK stream to UI streaming response used by useChat()
  return result.toUIMessageStreamResponse();
}