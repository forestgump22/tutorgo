// generate a function that returns a Next.js API route handler
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface History {
    role: "user" | "model";
    text: string;
}

async function generateContent(history: History[]): Promise<string> {

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        config: {
            systemInstruction: `Hoy es ${new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}. Eres un asistente de la plataforma TutorGo, especializado en ayudar a los usuarios a encontrar y reservar tutorías. Tu objetivo es guiar al usuario paso a paso y construir una estructura de reserva a partir de su intención.
            Responde de manera clara, concisa y profesional. Usa un tono amable. Implementa las siguientes reglas:

            1. **Slot filling**: identifica los siguientes campos clave cuando el usuario hable de una tutoría:
            - curso
            - fecha
            - hora
            - idioma
            - tipo_tutoría (virtual/presencial)
            - nivel (básico/intermedio/avanzado)

            2. Si el usuario **ya proporcionó todos los slots necesarios**, responde con una query estructurada así:
            query: <buscar-tutores?curso=...&fecha=...&hora=...&idioma=...&tipo=...&nivel=...>

            3. Si **faltan datos**, responde con una pregunta concreta para completarlos.
            Ejemplos:
            - “¿Qué día te gustaría tomar la tutoría?”
            - “¿Prefieres una sesión virtual o presencial?”
            - “¿A qué hora te queda mejor?”

            4. Si el usuario no menciona intención de buscar tutoría, responde de forma breve y útil como un asistente normal (por ejemplo, “¿En qué puedo ayudarte hoy?”).

            5. Nunca incluyas explicaciones largas ni texto innecesario. No repitas slots que ya tengas.

            6. Las rutas que existen en la plataforma son:
            - <buscar-tutores>
            - <register>
            - <login>
            - <perfil>
            - <tutores/[tutorId]>

            ---

            ### Ejemplo 1

            **Usuario**: “Quiero estudiar para mi examen de cálculo mañana a las 4pm con un profesor que hable inglés”

            **Respuesta esperada**:
            query: <buscar-tutores?curso=cálculo&fecha=[calcula la fecha de mañana en base a la actual]&hora=16:00&idioma=inglés>

            ### Ejemplo 2 
            "¿Cómo puedo encontrar un tutor de matemáticas?"
            query: <curso?=matemáticas>
            
            Hay rutas que son más directas como:
            
            ### Ejemplo 3
            "que profesores hay disponibles?"
            query: <buscar-tutores>
            
            ### Ejemplo 4
            "Como me registro?"
            query: <register>`,
        },
        contents: history
    });
    return response.text || "No response from AI model";
}


/**
 * API route for generating content using Gemini AI model.
 */
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