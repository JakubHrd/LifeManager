import React, { useState } from "react";
import { Button, Box, CircularProgress, Backdrop, Typography } from "@mui/material";

interface ChatGPTAssistantProps {
  endpoint: "chatgpt" | "chatgpt/suggest";
  data: any;
  systemPrompt: string;
  onResponse: (result: string | object) => void;
  label: string;
}

const ChatGPTAssistant: React.FC<ChatGPTAssistantProps> = ({
  endpoint,
  data,
  systemPrompt,
  onResponse,
  label
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/chat/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data, systemPrompt }),
      });
  
      const text = await res.text(); // 🧠 přečteme jako text pro případ HTML
      try {
        const result = JSON.parse(text);
        onResponse(result.updatedPlan || result.result || result.rawResponse);
      } catch (jsonErr) {
        console.error("❌ Chybný JSON:", text); // vypíšeme HTML/404 stránku
      }
    } catch (error) {
      console.error("Chyba při volání GPT:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <>
      <Button variant="outlined" onClick={handleClick}>{label}</Button>
      <Backdrop open={loading} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, flexDirection: "column", color: "#fff" }}>
        <Typography mb={2}>🧠 Generuji odpověď z ChatGPT...</Typography>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default ChatGPTAssistant;
