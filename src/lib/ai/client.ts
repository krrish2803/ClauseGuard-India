import OpenAI from "openai";

export const nvidiaClient = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || "",
  baseURL: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
});

export const MODEL = process.env.NVIDIA_MODEL || "nvidia/llama-3.1-nemotron-70b-instruct";
export const EMBEDDING_MODEL = "nvidia/nv-embed-qa-4";

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.3,
  maxTokens = 2048
): Promise<string> {
  try {
    const response = await nvidiaClient.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    });
    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("AI completion error:", error);
    return "";
  }
}

export async function generateJSONCompletion<T>(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.2
): Promise<T | null> {
  try {
    const response = await nvidiaClient.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: `${systemPrompt}\nRespond with valid JSON only, no markdown.` },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });
    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content) as T;
  } catch (error) {
    console.error("AI JSON completion error:", error);
    return null;
  }
}
