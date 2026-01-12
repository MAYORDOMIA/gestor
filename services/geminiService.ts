
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `Eres un asistente experto para Arista Studio 2, una empresa de aberturas de aluminio y vidriería. 
Tus funciones incluyen:
1. Ayudar a calcular dimensiones de perfiles y vidrios (considerando descuentos por línea: Modena, A30, etc.).
2. Sugerir el tipo de vidrio adecuado (DVH, Laminado, Templado) según la zona y seguridad.
3. Ayudar a redactar presupuestos profesionales.
4. Responder dudas técnicas sobre herrajes y estanqueidad.
Habla siempre de forma profesional y técnica en español.`;

export async function askGemini(prompt: string) {
  // Directly use process.env.API_KEY as per the library guidelines
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key no configurada.");
    return "El asistente de IA no está configurado (falta API Key), pero puedes seguir usando el resto del sistema de gestión comercial.";
  }

  try {
    // Initializing with named parameter as required by @google/genai guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Calling generateContent directly with the model and prompt, using correct model naming
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    // Extracting text using the .text property (not a method) as per SDK documentation
    return response.text || "No obtuve respuesta del modelo.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Hubo un problema al procesar tu consulta técnica. Verifica la conexión o intenta más tarde.";
  }
}
