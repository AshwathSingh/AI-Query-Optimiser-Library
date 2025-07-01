// AI Models Configuration Library
// This module provides a plug-and-play interface for different AI models

// Text length thresholds for model selection
export const TEXT_LENGTH_THRESHOLDS = {
  SHORT: 100, // 0-100 characters: use smaller models
  MEDIUM: 500, // 101-500 characters: use medium models
  LONG: 1000, // 501-1000 characters: use larger models
  VERY_LONG: 2000, // 1000+ characters: use best models
};

// Model registry - easily add new models here
export const MODEL_REGISTRY = {
  // Groq Cloud Models
  "llama3-8b-8192": {
    provider: "groq",
    name: "Llama 3 8B",
    maxTokens: 8192,
    costPer1kTokens: 0.00005, // USD
    speed: "fast",
    quality: "good",
    bestFor: ["short", "medium"],
    capabilities: ["chat", "analysis", "summarization"],
    contextConfig: {
      maxContextMessages: 3,
      maxTokens: 4000,
      contextStrategy: "recent",
    },
  },
  "llama3-70b-8192": {
    provider: "groq",
    name: "Llama 3 70B",
    maxTokens: 8192,
    costPer1kTokens: 0.00059, // USD
    speed: "medium",
    quality: "excellent",
    bestFor: ["medium", "long", "very_long"],
    capabilities: ["chat", "analysis", "summarization", "creation", "ideation"],
    contextConfig: {
      maxContextMessages: 6,
      maxTokens: 8000,
      contextStrategy: "smart",
    },
  },
  "mixtral-8x7b-32768": {
    provider: "groq",
    name: "Mixtral 8x7B",
    maxTokens: 32768,
    costPer1kTokens: 0.00024, // USD
    speed: "medium",
    quality: "excellent",
    bestFor: ["long", "very_long"],
    capabilities: [
      "chat",
      "analysis",
      "summarization",
      "creation",
      "ideation",
      "conversion",
    ],
    contextConfig: {
      maxContextMessages: 8,
      maxTokens: 16000,
      contextStrategy: "comprehensive",
    },
  },
  "gpt-4": {
    provider: "openai",
    name: "GPT-4",
    maxTokens: 8192,
    costPer1kTokens: 0.03, // USD (input)
    speed: "medium",
    quality: "excellent",
    bestFor: ["medium", "long", "very_long"],
    capabilities: [
      "chat",
      "analysis",
      "summarization",
      "creation",
      "ideation",
      "conversion",
    ],
    contextConfig: {
      maxContextMessages: 10,
      maxTokens: 6000,
      contextStrategy: "comprehensive",
    },
  },
  "claude-3-sonnet": {
    provider: "anthropic",
    name: "Claude 3 Sonnet",
    maxTokens: 200000,
    costPer1kTokens: 0.03, // USD
    speed: "medium",
    quality: "excellent",
    bestFor: ["long", "very_long"],
    capabilities: [
      "chat",
      "analysis",
      "summarization",
      "creation",
      "ideation",
      "conversion",
    ],
    contextConfig: {
      maxContextMessages: 12,
      maxTokens: 100000,
      contextStrategy: "comprehensive",
    },
  },
};

// Default model mappings for different complexity levels
export const DEFAULT_MODELS = {
  SHORT: "llama3-8b-8192",
  MEDIUM: "llama3-70b-8192",
  LONG: "mixtral-8x7b-32768",
  VERY_LONG: "llama3-70b-8192",
};

// Model selection strategies
export const MODEL_SELECTION_STRATEGIES = {
  // Cost-optimized: prioritize cheaper models
  COST_OPTIMIZED: {
    SHORT: "llama3-8b-8192",
    MEDIUM: "llama3-8b-8192",
    LONG: "llama3-70b-8192",
    VERY_LONG: "llama3-70b-8192",
  },
  // Quality-optimized: prioritize better models
  QUALITY_OPTIMIZED: {
    SHORT: "llama3-70b-8192",
    MEDIUM: "llama3-70b-8192",
    LONG: "mixtral-8x7b-32768",
    VERY_LONG: "claude-3-sonnet",
  },
  // Speed-optimized: prioritize faster models
  SPEED_OPTIMIZED: {
    SHORT: "llama3-8b-8192",
    MEDIUM: "llama3-8b-8192",
    LONG: "llama3-8b-8192",
    VERY_LONG: "llama3-70b-8192",
  },
  // Balanced: good balance of cost, quality, and speed
  BALANCED: {
    SHORT: "llama3-8b-8192",
    MEDIUM: "llama3-70b-8192",
    LONG: "mixtral-8x7b-32768",
    VERY_LONG: "llama3-70b-8192",
  },
};

// Model utility functions
export class ModelManager {
  constructor(strategy = "BALANCED") {
    this.strategy = strategy;
    this.models =
      MODEL_SELECTION_STRATEGIES[strategy] ||
      MODEL_SELECTION_STRATEGIES.BALANCED;
  }

  // Get model for a given complexity
  getModelForComplexity(complexity) {
    return this.models[complexity] || this.models.SHORT;
  }

  // Get model configuration
  getModelConfig(modelId) {
    return MODEL_REGISTRY[modelId] || MODEL_REGISTRY["llama3-8b-8192"];
  }

  // Check if model supports a specific capability
  modelSupportsCapability(modelId, capability) {
    const config = this.getModelConfig(modelId);
    return config.capabilities.includes(capability);
  }

  // Get all available models
  getAvailableModels() {
    return Object.keys(MODEL_REGISTRY);
  }

  // Get models by provider
  getModelsByProvider(provider) {
    return Object.entries(MODEL_REGISTRY)
      .filter(([_, config]) => config.provider === provider)
      .map(([id, config]) => ({ id, ...config }));
  }

  // Estimate cost for a model
  estimateCost(modelId, inputTokens, outputTokens = 0) {
    const config = this.getModelConfig(modelId);
    const inputCost = (inputTokens / 1000) * config.costPer1kTokens;
    const outputCost = (outputTokens / 1000) * (config.costPer1kTokens * 2); // Output typically costs more
    return inputCost + outputCost;
  }

  // Change selection strategy
  setStrategy(strategy) {
    if (MODEL_SELECTION_STRATEGIES[strategy]) {
      this.strategy = strategy;
      this.models = MODEL_SELECTION_STRATEGIES[strategy];
    }
  }

  // Get current strategy
  getStrategy() {
    return this.strategy;
  }
}

// Export default model manager instance
let _defaultModelManager = null;

export function getDefaultModelManager() {
  if (!_defaultModelManager) {
    _defaultModelManager = new ModelManager("BALANCED");
  }
  return _defaultModelManager;
}

// For backward compatibility
export const defaultModelManager = getDefaultModelManager();
