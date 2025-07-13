import { Request, Response } from "express";
import axios from "axios";
import { simplifyData } from "../utils/simplifyData";
import dotenv from "dotenv";

dotenv.config();

interface ChatGPTRequest {
  /**
   * The data to be passed to the GPT model.
   * The data should be a JSON object.
   */
  data: any;
  /**
   * The system prompt to be passed to the GPT model.
   * The system prompt should be a string.
   */
  systemPrompt: string;
}

/**
 * Handles a request to generate a response from ChatGPT.
 * @param {Request<{}, {}, ChatGPTRequest>} req Request object
 * @param {Response} res Response object
 * @returns {Promise<void>}
 */
export const handleChatGPTRequest = async (
  req: Request<{}, {}, ChatGPTRequest>,
  res: Response
): Promise<void> => {
  const { data, systemPrompt } = req.body;
  const simplified = simplifyData(data);

  console.log("simplified data backend", {
    simplifiedData: JSON.stringify(simplified, null, 2),
  });

  try {
    /**
     * The request to the OpenAI API.
     * The request should contain the model, the system prompt, and the user message.
     */
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Here are the data:\n${JSON.stringify(simplified, null, 2)}`,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    /**
     * The content of the response from the OpenAI API.
     * The content should be a JSON object.
     */
    const content = response.data.choices[0].message.content;

    try {
      /**
       * The parsed content of the response from the OpenAI API.
       * The parsed content should be a JSON object.
       */
      const parsed = JSON.parse(content);
      res.json({ result: parsed });
    } catch {
      /**
       * If the content of the response from the OpenAI API is not a valid JSON object,
       * returns the raw response.
       */
      res.json({ rawResponse: content });
    }
  } catch (error: any) {
    console.error("Failed to call OpenAI API:", error);
    if (error.response?.status === 429) {
      res.status(429).json({ message: "Rate limit exceeded for OpenAI API." });
      return;
    }
    res.status(500).json({ message: "Failed to get response from GPT." });
  }
};

