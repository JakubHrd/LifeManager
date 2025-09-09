import React, { useState } from "react";
import { Button, Box, CircularProgress, Backdrop, Typography } from "@mui/material";
import serverUrl from "../config";

interface ChatGPTAssistantProps {
  endpoint: "chatgpt" | "chatgpt/suggest";
  data: any;
  systemPrompt: string;
  onResponse: (result: string | object) => void;
  label: string;
  userSetting?: any;
}

/** Pomocná — zkusí vyparsovat JSON i z textové odpovědi (code block, volný JSON, atd.) */
function smartParseJson(text: string): { ok: boolean; value?: any } {
  // 1) Zkus čistý JSON
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {}

  // 2) Zkus code block ```json ... ```
  const codeBlockMatch = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    const inner = codeBlockMatch[1].trim();
    try {
      return { ok: true, value: JSON.parse(inner) };
    } catch {}
  }

  // 3) Heuristika: najdi první { a poslední } a zkus to
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    const maybeJson = text.slice(first, last + 1);
    try {
      return { ok: true, value: JSON.parse(maybeJson) };
    } catch {}
  }

  return { ok: false };
}

const ChatGPTAssistant: React.FC<ChatGPTAssistantProps> = ({
  endpoint,
  data,
  systemPrompt,
  onResponse,
  label,
  userSetting,
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${serverUrl}/api/chat/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data, userSetting, systemPrompt }),
      });

      const text = await res.text();

      if (!res.ok) {
        // vrať aspoň text s chybou, ať je vidět co přišlo
        onResponse(text || "Chyba: nepodařilo se získat odpověď od serveru.");
        return;
      }

      // Zkus chytře vyparsovat
      const parsed = smartParseJson(text);
      if (parsed.ok) {
        const obj = parsed.value;
        // sjednocení nejčastějších tvarů odpovědí
        const unified =
          obj?.updatedPlan ??
          obj?.result ??
          obj?.rawResponse ??
          obj; // fallback – přímo objekt
        onResponse(unified);
      } else {
        // fallback — vrať plain text
        onResponse(text);
      }
    } catch (error: any) {
      onResponse(`Chyba při volání GPT: ${error?.message || String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outlined" onClick={handleClick}>{label}</Button>
      <Backdrop
        open={loading}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: "column",
          color: "#fff",
        }}
      >
        <Typography mb={2}>🧠 Generuji odpověď…</Typography>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default ChatGPTAssistant;
