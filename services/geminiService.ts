
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `Eres un asistente experto para Arista Studio 2, una empresa de aberturas de aluminio y vidriería. 
Tus funciones incluyen:
1. Ayudar a calcular dimensiones de perfiles y vidrios (considerando descuentos por línea: Modena, A30, etc.).
2. Sugerir el tipo de vidrio adecuado (DVH, Laminado, Templado) según la zona y seguridad.
3. Ayudar a redactar presupuestos profesionales.
4. Responder dudas técnicas sobre herrajes y estanqueidad.
Habla siempre de forma profesional y técnica en español.`;

export async function askGemini(prompt: string) {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });
    
    // Acceso directo a .text según las directrices de la SDK
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Lo siento, tuve un problema al procesar tu consulta técnica. Por favor intenta de nuevo.";
  }
}
