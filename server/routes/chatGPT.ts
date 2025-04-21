import { Router, Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router: Router = Router();

// Pomocná funkce pro zjednodušení struktury jídelníčku nebo tréninků
const simplifyData = (data: any): Record<string, Record<string, string>> => {
  const simplified: Record<string, Record<string, string>> = {};
  for (const [day, entries] of Object.entries(data)) {
    simplified[day] = {};
    for (const [type, value] of Object.entries(entries as any)) {
      simplified[day][type] = (value as any).description || "";
    }
  }
  return simplified;
};

interface ChatGPTRequest {
  data: any;
  systemPrompt: string;
}

router.post("/chatgpt", async (req: Request<{}, {}, ChatGPTRequest>, res: Response) => {
  const { data, systemPrompt } = req.body;
  const simplified = simplifyData(data);
  console.log('simplified data backend',{simplifiedData: JSON.stringify(simplified, null, 2)})
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Zde jsou data:\n${JSON.stringify(simplified, null, 2)}`
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const content = response.data.choices[0].message.content;

    try {
      const parsed = JSON.parse(content);
      res.json({ result: parsed });
    } catch (err) {
      res.json({ rawResponse: content });
    }

  } catch (error: any) {
    console.error("❌ Chyba při volání OpenAI API:", error);
    if (error.response?.status === 429) {
      res.status(429).json({ message: "Překročen limit požadavků na OpenAI API." });
      return;
    }
    res.status(500).json({ message: "Nepodařilo se získat odpověď od GPT." });
  }
});

export default router;
