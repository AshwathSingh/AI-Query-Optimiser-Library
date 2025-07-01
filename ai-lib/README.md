# ai-lib

A plug-and-play JavaScript library for orchestrating AI queries using GroqCloud and other LLM providers.

## Features

- Unified interface for multiple LLM providers (GroqCloud, OpenAI, Anthropic)
- Model selection, prompt management, context handling, and task classification
- Task classification always uses `llama3-8b-8192` from GroqCloud
- Easily set API keys for providers (e.g., GroqCloud)
- Modular and extensible design

## Installation

Copy the `ai-lib` folder into your project, or bundle it as an npm package for reuse.

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

## Supported Providers

- GroqCloud (Llama 3, Mixtral)
- OpenAI (GPT-4)
- Anthropic (Claude 3 Sonnet)

## License

MIT
