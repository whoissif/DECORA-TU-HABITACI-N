
import { GoogleGenAI } from "@google/genai";

export async function redecorateRoom(imageData: string, prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Extract base64 data and mime type from data URL
  const mimeType = imageData.split(';')[0].split(':')[1];
  const base64Data = imageData.split(',')[1];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `Redecora esta habitación según la siguiente instrucción: ${prompt}. Mantén la estructura básica de la habitación (paredes, ventanas, puertas) pero transforma completamente los muebles, colores, iluminación y estilo para que coincida exactamente con la solicitud. Genera una imagen realista de alta calidad de la habitación redecorada.`,
          },
        ],
      },
    });

    let modifiedImageUrl = '';

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          modifiedImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!modifiedImageUrl) {
      throw new Error("La IA no generó ninguna imagen.");
    }

    return modifiedImageUrl;
  } catch (error) {
    console.error("Error de la API de Gemini:", error);
    throw new Error(error instanceof Error ? error.message : "Error al procesar la imagen.");
  }
}
