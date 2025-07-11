import { generateContent, History } from "@/lib/server/genai";

export async function POST(req: Request): Promise<Response> {
    const data = await req.json();
    const chats: History[] = data.chats;

    const result = await generateContent(chats);

    return new Response(
        JSON.stringify({
            response: result,
        }),
    );
}