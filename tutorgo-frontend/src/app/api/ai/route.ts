// generate a function that returns a Next.js API route handler
import { generateContent, History } from "@/lib/server/genai";

export async function POST(req: Request): Promise<Response> {
    /**
     * Get the prompt from the request body.
     */
    const data = await req.json();
    const chats: History[] = data.chats;

    /**
     * Use the Gemini AI model to generate content from the prompt.
     */
    const result = await generateContent(chats);

    /**
     * Return the generated content as a JSON response.
     */
    return new Response(
        JSON.stringify({
            response: result,
        }),
    );
}