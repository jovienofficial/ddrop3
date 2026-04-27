import { GoogleGenAI, Type } from "@google/genai";
import { ComparisonResult } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async findDeals(
    amazonUrl: string,
    location: string,
    condition: string,
    sitesToSkip: string[]
  ): Promise<ComparisonResult> {
    const prompt = `
      Find the exact product from this Amazon.in URL: ${amazonUrl}
      Search for its current price, stock, and delivery information across all major Indian shopping websites.
      
      Websites to search: Flipkart, Meesho, JioMart, Croma, Reliance Digital, Tata CLiQ, Snapdeal, Ajio, BigBasket, and more.
      Websites to SKIP: ${sitesToSkip.length > 0 ? sitesToSkip.join(", ") : "None"}
      
      User Location: ${location}
      Product Condition: ${condition}
      
      Return a summary string and a list of deals.
      The deals should be ranked from cheapest to most expensive.
      Mark the cheapest one as isBestDeal: true.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }] as any,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "A one-line summary like 'Found on 5 sites — Best price ₹19,999 on Flipkart'" },
              deals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    siteName: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    currency: { type: Type.STRING, description: "Should be INR or ₹" },
                    url: { type: Type.STRING },
                    stockStatus: { type: Type.STRING, description: "In Stock, Out of Stock, etc." },
                    deliveryInfo: { type: Type.STRING, description: "Estimated delivery time" },
                    isBestDeal: { type: Type.BOOLEAN }
                  },
                  required: ["siteName", "price", "url"]
                }
              }
            },
            required: ["summary", "deals"]
          }
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI");

      try {
        const parsed = JSON.parse(text) as ComparisonResult;
        return parsed;
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, text);
        return {
          summary: "Error parsing structured data. Showing raw results instead.",
          deals: [],
          rawResponse: text
        };
      }
    } catch (error: any) {
      console.error("Gemini Error:", error);
      throw error;
    }
  }
}
