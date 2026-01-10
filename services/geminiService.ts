
import { GoogleGenAI } from "@google/genai";

// Función segura para obtener la API Key
const getApiKey = (): string => {
  try {
    // Intentar obtenerla del entorno. Si falla, devolver string vacío.
    // Esto previene que la aplicación "crashee" al inicio.
    const key = process.env.API_KEY;
    return key || '';
  } catch {
    return '';
  }
};

const SYSTEM_PROMPT = `Eres un asistente experto para Arista Studio 2, una empresa de aberturas de aluminio y vidriería. 
Tus funciones incluyen:
1. Ayudar a calcular dimensiones de perfiles y vidrios (considerando descuentos por línea: Modena, A30, etc.).
2. Sugerir el tipo de vidrio adecuado (DVH, Laminado, Templado) según la zona y seguridad.
3. Ayudar a redactar presupuestos profesionales.
4. Responder dudas técnicas sobre herrajes y estanqueidad.
Habla siempre de forma profesional y técnica en español.`;

export async function askGemini(prompt: string) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.warn("Gemini API Key no configurada.");
    return "El asistente de IA no está configurado (falta API Key), pero puedes seguir usando el resto del sistema de gestión comercial.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });
    return response.text || "No obtuve respuesta del modelo.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Hubo un problema al procesar tu consulta técnica. Verifica la conexión o intenta más tarde.";
  }
}
