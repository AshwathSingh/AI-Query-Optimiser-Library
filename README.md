# ai-lib

A plug-and-play JavaScript library for orchestrating AI queries using GroqCloud and other LLM providers.

## Installation

Copy the `ai-lib` folder into your project

## Usage

```js
import { createAIOrchestrator, setApiKey } from "./ai-lib";

// Set your GroqCloud API key
setApiKey("groq", "YOUR_GROQCLOUD_API_KEY");

// Create an orchestrator instance
const ai = createAIOrchestrator();

// Process a query
const result = await ai.processQuery("Summarize this text...", chatHistory);
console.log(result);
```

## API

- `setApiKey(provider, key)`: Set the API key for a provider (e.g., 'groq').
- `createAIOrchestrator(config)`: Create a new AI orchestrator instance.
- `processQuery(queryText, chatHistory)`: Process a user query and get an AI response.

## License

MIT
