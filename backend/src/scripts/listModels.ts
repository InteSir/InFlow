import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const genAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

async function main() {
  const models = await genAi.models.list();
  for await (const model of models) {
    console.log(model.name);
  }
}

main().catch(console.error);