// LLM Client Library
// This module handles API calls to different LLM providers

// LLM client class
export class LLMClient {
  constructor() {
    this.endpoints = {
      groq: "https://api.groq.com/openai/v1/chat/completions", // Updated to GroqCloud API
      openai: "/api/openai", // Future OpenAI endpoint
      anthropic: "/api/anthropic", // Future Anthropic endpoint
    };
    this.apiKeys = {
      groq: null,
      openai: null,
      anthropic: null,
    };
  }

  // Set API key for a provider
  setApiKey(provider, key) {
    this.apiKeys[provider] = key;
  }

  // Get API key for a provider
  getApiKey(provider) {
    return this.apiKeys[provider];
  }

  // Main method to call LLM
  async callLLM(params) {
    const {
      model,
      messages,
      maxTokens,
      temperature,
      task,
      complexity,
      reason,
      contextMessages,
    } = params;

    console.log("Calling LLM with params:", {
      model,
      task,
      temperature,
      maxTokens,
      complexity,
      contextMessages: contextMessages?.length || 0,
    });

    try {
      // Determine provider from model
      const provider = this.getProviderFromModel(model);
      const endpoint = this.endpoints[provider] || this.endpoints.groq;
      const apiKey = this.getApiKey(provider);

      const headers = {
        "Content-Type": "application/json",
      };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return this.createErrorResponse("LLM call failed", errorText, params);
      }

      const result = await response.json();
      return this.createSuccessResponse(result, params);
    } catch (error) {
      return this.createErrorResponse("LLM call error", error.message, params);
    }
  }

  // Get provider from model name
  getProviderFromModel(model) {
    if (model.includes("llama") || model.includes("mixtral")) {
      return "groq";
    } else if (model.includes("gpt")) {
      return "openai";
    } else if (model.includes("claude")) {
      return "anthropic";
    }
    return "groq"; // Default to groq
  }

  // Create success response
  createSuccessResponse(result, params) {
    return {
      ...result,
      temperature: params.temperature,
      model: params.model,
      task: params.task,
      complexity: params.complexity,
      reason: params.reason,
      contextMessages: params.contextMessages?.length || 0,
      success: true,
    };
  }

  // Create error response
  createErrorResponse(error, details, params) {
    return {
      error,
      details,
      temperature: params.temperature,
      model: params.model,
      task: params.task,
      complexity: params.complexity,
      reason: params.reason,
      contextMessages: params.contextMessages?.length || 0,
      success: false,
    };
  }

  // Test model availability
  async testModel(model) {
    try {
      const testParams = {
        model,
        messages: [{ role: "user", content: "Hello" }],
        maxTokens: 10,
        temperature: 0.1,
        task: "LLM_Default",
        complexity: "SHORT",
        reason: "Test",
        contextMessages: [],
      };

      const result = await this.callLLM(testParams);
      return result.success;
    } catch (error) {
      return false;
    }
  }

  // Get available models from provider
  async getAvailableModels(provider = "groq") {
    try {
      const response = await fetch(`/api/models?provider=${provider}`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error("Error fetching available models:", error);
      return [];
    }
  }

  // Set custom endpoint
  setEndpoint(provider, endpoint) {
    this.endpoints[provider] = endpoint;
  }

  // Get endpoint for provider
  getEndpoint(provider) {
    return this.endpoints[provider];
  }
}

// Export default LLM client instance
let _defaultLLMClient = null;

export function getDefaultLLMClient() {
  if (!_defaultLLMClient) {
    _defaultLLMClient = new LLMClient();
  }
  return _defaultLLMClient;
}

// For backward compatibility
export const defaultLLMClient = getDefaultLLMClient();
