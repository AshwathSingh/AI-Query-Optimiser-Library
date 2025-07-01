# ai-lib

A plug-and-play JavaScript library for orchestrating AI queries using GroqCloud and other LLM providers. This library provides a modular, extensible architecture for building AI-powered applications with advanced context, prompt, and model management.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [API Reference](#api-reference)
  - [AIOrchestrator](#aiorchestrator)
  - [ModelManager](#modelmanager)
  - [TaskClassifier](#taskclassifier)
  - [PromptManager](#promptmanager)
  - [ContextManager](#contextmanager)
  - [LLMClient](#llmclient)
  - [ChatTitleGenerator](#chattitlegenerator)
- [Customization & Extension](#customization--extension)
- [Advanced Examples](#advanced-examples)
- [Tips & Best Practices](#tips--best-practices)
- [License](#license)

---

## Installation

Copy the `ai-lib` folder into your project.

---

## Quick Start

```js
import { createAIOrchestrator, setApiKey } from "./ai-lib";

// Set your GroqCloud API key
setApiKey("groq", "YOUR_GROQCLOUD_API_KEY");

// Create an orchestrator instance
const ai = createAIOrchestrator();

// Example chat history structure
const chatHistory = {
  messages: [
    { user: "What is the capital of France?", response: "Paris." },
    { user: "Tell me more about its history." },
  ],
};

// Process a query
const result = await ai.processQuery(
  "Summarize the history of Paris.",
  chatHistory
);
console.log(result.response); // AI-generated summary
```

---

## Architecture Overview

The library is built around the `AIOrchestrator` class, which coordinates the following components:

- **ModelManager**: Handles model selection, configuration, and cost estimation.
- **TaskClassifier**: Determines the type of user query and selects the appropriate model.
- **PromptManager**: Manages system prompts and dynamic prompt generation.
- **ContextManager**: Selects and optimizes chat history/context for LLM calls.
- **LLMClient**: Handles API calls to LLM providers (GroqCloud, OpenAI, Anthropic, etc.).
- **ChatTitleGenerator**: Generates and updates smart chat titles using AI.

Each component can be customized or replaced for advanced use cases.

---

## API Reference

### AIOrchestrator

The main entry point for all AI operations.

**Constructor:**

```js
new AIOrchestrator((options = {}));
```

- `options`: Optional custom components (modelManager, taskClassifier, promptManager, contextManager, llmClient, chatTitleGenerator)

**Methods:**

- `processQuery(queryText, chatHistory = null)`: Classifies the query, builds prompts, selects context, and calls the LLM. Returns a response with metadata.
  - **Example:**
    ```js
    const result = await ai.processQuery(
      "Write a creative story about a robot."
    );
    console.log(result.response); // AI-generated story
    ```
- `generateChatTitle(firstMessage)`: Generates a chat title for a new conversation.
  - **Example:**
    ```js
    const title = await ai.generateChatTitle(
      "Let's discuss climate change solutions."
    );
    // title: "Climate Change Solutions"
    ```
- `updateChatTitleDynamically(messages, currentTitle)`: Updates the chat title as the conversation evolves.
  - **Example:**
    ```js
    const updatedTitle = await ai.updateChatTitleDynamically(
      chatHistory.messages,
      "Initial Title"
    );
    ```
- `configure(options)`: Dynamically update strategies or swap components.
- `addCustomModel(modelId, config)`: Add a custom model to the registry.
- `addCustomTask(taskType, config)`: Add a custom task type.
- `addCustomPrompt(taskType, promptFunction)`: Add a custom system prompt.
- `estimateCost(modelId, inputTokens, outputTokens = 0)`: Estimate the cost of a model call.

**Factory Functions:**

- `createAIOrchestrator(config = {})`: Returns a new orchestrator instance.
- `getDefaultAIOrchestrator()`: Returns a singleton orchestrator instance.
- `setApiKey(provider, key)`: Set the API key for a provider.
- `getApiKey(provider)`: Get the API key for a provider.

---

### ModelManager

Handles model selection, configuration, and cost estimation.

**Constructor:**

```js
new ModelManager((strategy = "BALANCED"));
```

- `strategy`: Model selection strategy (`BALANCED`, `COST_OPTIMIZED`, `QUALITY_OPTIMIZED`, `SPEED_OPTIMIZED`)

**Methods:**

- `getModelForComplexity(complexity)`: Returns the model ID for a given complexity (`SHORT`, `MEDIUM`, `LONG`, `VERY_LONG`).
- `getModelConfig(modelId)`: Returns the config object for a model.
- `modelSupportsCapability(modelId, capability)`: Checks if a model supports a capability (e.g., `analysis`).
- `getAvailableModels()`: Returns all available model IDs.
- `getModelsByProvider(provider)`: Returns all models for a provider.
- `estimateCost(modelId, inputTokens, outputTokens = 0)`: Estimates the cost in USD.
- `setStrategy(strategy)`: Change the model selection strategy.
- `getStrategy()`: Get the current strategy.

**Example:**

```js
import { ModelManager } from "./ai-lib";
const mm = new ModelManager("QUALITY_OPTIMIZED");
console.log(mm.getAvailableModels());
```

**Factory Functions:**

- `getDefaultModelManager()`: Returns a singleton model manager.

---

### TaskClassifier

Determines the task type and selects the model for a query.

**Constructor:**

```js
new TaskClassifier((modelManager = defaultModelManager));
```

**Methods:**

- `classifyQuery(queryText)`: Returns a classification object `{ task, model, complexity, reason, stats }`.
  - **Example:**
    ```js
    const classifier = new TaskClassifier();
    const info = await classifier.classifyQuery("Summarize this article.");
    console.log(info.task); // e.g., "LLM_Summary"
    ```
- `determineTaskType(queryText)`: Returns the task type identifier based on keywords.
- `getModelForTask(task, complexity)`: Returns the model ID for a task and complexity.
- `getTaskConfig(taskType)`: Returns the config for a task type.
- `getAvailableTasks()`: Returns all available task types.
- `setModelManager(modelManager)`: Set the model manager.

**Factory Functions:**

- `getDefaultTaskClassifier()`: Returns a singleton task classifier.

---

### PromptManager

Manages system prompts and dynamic prompt generation.

**Constructor:**

```js
new PromptManager();
```

**Methods:**

- `getSystemPrompt(task, maxTokens, complexity)`: Returns the system prompt string.
- `getTokenLimit(task, complexity)`: Returns the token limit for a task and complexity.
- `getTemperature(task, complexity, contextLength)`: Returns the temperature for a task, complexity, and context length.
- `addSystemPrompt(taskType, promptFunction)`: Add a custom system prompt.
- `removeSystemPrompt(taskType)`: Remove a custom system prompt.
- `getAvailablePromptTypes()`: Returns all available prompt types.

**Example:**

```js
import { PromptManager } from "./ai-lib";
const pm = new PromptManager();
const prompt = pm.getSystemPrompt("LLM_Summary", 2000, "LONG");
console.log(prompt);
```

**Factory Functions:**

- `getDefaultPromptManager()`: Returns a singleton prompt manager.

---

### ContextManager

Selects and optimizes chat history/context for LLM calls.

**Constructor:**

```js
new ContextManager((modelManager = defaultModelManager));
```

**Methods:**

- `selectContextMessages(messages, model, maxContextMessages)`: Selects context messages based on strategy.
- `optimizeContext(contextMessages, model, maxTokens)`: Truncates messages to fit token limits.
- `estimateTokenCount(text)`: Estimates token count for a string.
- `buildMessagesArray(systemPrompt, contextMessages, userQuery)`: Builds the messages array for the LLM API.
- `processChatHistory(chatHistory)`: Converts chat history into context messages.
- `getContextStats(contextMessages, model)`: Returns stats about the context.
- `setModelManager(modelManager)`: Set the model manager.

**Example:**

```js
import { ContextManager } from "./ai-lib";
const cm = new ContextManager();
const contextMsgs = cm.processChatHistory(chatHistory);
console.log(contextMsgs);
```

**Factory Functions:**

- `getDefaultContextManager()`: Returns a singleton context manager.

---

### LLMClient

Handles API calls to LLM providers.

**Constructor:**

```js
new LLMClient();
```

**Methods:**

- `setApiKey(provider, key)`: Set the API key for a provider.
- `getApiKey(provider)`: Get the API key for a provider.
- `callLLM(params)`: Main method to call an LLM. Handles endpoint selection, API key, and request formatting.
  - **Example:**
    ```js
    import { LLMClient } from "./ai-lib";
    const client = new LLMClient();
    client.setApiKey("groq", "YOUR_KEY");
    const result = await client.callLLM({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "What is the weather today?" },
      ],
      maxTokens: 100,
      temperature: 0.2,
    });
    console.log(result.response);
    ```
- `getProviderFromModel(model)`: Returns the provider name from the model name.
- `createSuccessResponse(result, params)`: Formats a successful response.
- `createErrorResponse(error, details, params)`: Formats an error response.
- `testModel(model)`: Test if a model is available.
- `getAvailableModels(provider)`: Get available models from a provider.
- `setEndpoint(provider, endpoint)`: Set a custom endpoint for a provider.
- `getEndpoint(provider)`: Get the endpoint for a provider.

**Factory Functions:**

- `getDefaultLLMClient()`: Returns a singleton LLM client.

---

### ChatTitleGenerator

Generates and updates smart chat titles using AI.

**Constructor:**

```js
new ChatTitleGenerator((aiOrchestrator = null));
```

**Methods:**

- `setAIOrchestrator(aiOrchestrator)`: Set the AI orchestrator.
- `getAIOrchestrator()`: Get or load the AI orchestrator.
- `generateChatTitle(firstMessage)`: Generate a chat title using the first message.
  - **Example:**
    ```js
    import { ChatTitleGenerator } from "./ai-lib";
    const gen = new ChatTitleGenerator();
    const title = await gen.generateChatTitle(
      "Let's talk about AI in healthcare."
    );
    console.log(title); // e.g., "AI in Healthcare"
    ```
- `generateFallbackTitle(message)`: Generate a fallback title using text processing.
- `cleanTitle(title)`: Clean up the generated title.
- `generateTitleFromChatContent(messages)`: Generate a title from the first few messages.
- `updateChatTitleDynamically(messages, currentTitle)`: Dynamically update the chat title as the conversation grows.

**Factory Functions:**

- `getDefaultChatTitleGenerator()`: Returns a singleton chat title generator.

---

## Customization & Extension

You can provide your own implementations for any component by passing them to the `AIOrchestrator` constructor or using the `configure` method. You can also add custom models, tasks, and prompts at runtime.

**Example: Customizing Model Selection**

```js
import { createAIOrchestrator, ModelManager } from "./ai-lib";
const customModelManager = new ModelManager("QUALITY_OPTIMIZED");
const ai = createAIOrchestrator({ modelManager: customModelManager });
```

**Example: Adding a Custom Task and Prompt**

```js
ai.addCustomTask("LLM_CodeReview", {
  keywords: ["review code", "code review"],
});
ai.addCustomPrompt(
  "LLM_CodeReview",
  (maxTokens, complexity) =>
    `You are a code review assistant. You have ${maxTokens} tokens. Provide a detailed review.`
);
```

**Example: Using with OpenAI or Anthropic**

```js
setApiKey("openai", "YOUR_OPENAI_API_KEY");
setApiKey("anthropic", "YOUR_ANTHROPIC_API_KEY");
```

---

## Advanced Examples

**Summarization Task**

```js
const summary = await ai.processQuery(
  "Summarize the following: ...",
  chatHistory
);
console.log(summary.response);
```

**Creative Writing Task**

```js
const story = await ai.processQuery("Write a poem about the ocean.");
console.log(story.response);
```

**Analysis Task**

```js
const analysis = await ai.processQuery(
  "Analyze the sentiment of this review: ..."
);
console.log(analysis.response);
```

**Chat Title Generation**

```js
const title = await ai.generateChatTitle("Let's brainstorm startup ideas.");
console.log(title); // e.g., "Startup Ideas Brainstorm"
```

---

## Tips & Best Practices

- **chatHistory Structure:** Always provide chat history as an object with a `messages` array. Each message should have a `user` field and optionally a `response` field.
- **Token Limits:** Be mindful of token limits for each model. Use `PromptManager.getTokenLimit()` to check.
- **Custom Prompts:** For specialized tasks, add your own prompt functions for better results.
- **Model Selection:** Choose a strategy (`BALANCED`, `QUALITY_OPTIMIZED`, etc.) that fits your use case (cost, speed, or quality).
- **API Keys:** Always set the correct API key for the provider you intend to use.
- **Debugging:** Use the metadata in the response for debugging and optimization.

---

## License

MIT
