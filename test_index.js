import { createAIOrchestrator, setApiKey } from "./ai-lib/index.js";
import dotenv from "dotenv";
dotenv.config();

// Set your GroqCloud API key
setApiKey("groq", process.env.GROQ_API_KEY);

// Create an orchestrator instance
const ai = createAIOrchestrator();

// Provide a mock chat history for testing
const chatHistory = {
  messages: [
    {
      user: "What is the capital of France?",
      response: "The capital of France is Paris.",
    },
  ],
};

// Test a query
ai.processQuery("What happened in this conversation?", chatHistory)
  .then((result) => {
    // Try to print just the LLM's response if available
    if (
      result &&
      result.choices &&
      result.choices[0] &&
      result.choices[0].message &&
      result.choices[0].message.content
    ) {
      console.log("LLM Response:", result.choices[0].message.content);
    } else {
      console.log("Full result:", result);
    }
  })
  .catch((err) => {
    console.error("Test failed:", err);
  });
