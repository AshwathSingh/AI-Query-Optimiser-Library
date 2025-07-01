// AI Library - Main Interface
// This module provides a unified plug-and-play interface for AI functionality

import {
  ModelManager,
  MODEL_REGISTRY,
  MODEL_SELECTION_STRATEGIES,
  getDefaultModelManager,
} from "./models.js";

import {
  TaskClassifier,
  TASK_TYPES,
  TextComplexityAnalyzer,
  getDefaultTaskClassifier,
} from "./taskClassifier.js";

import {
  PromptManager,
  SYSTEM_PROMPTS,
  getDefaultPromptManager,
} from "./prompts.js";

import {
  ContextManager,
  CONTEXT_STRATEGIES,
  getDefaultContextManager,
} from "./contextManager.js";

import { LLMClient, getDefaultLLMClient } from "./llmClient.js";

import {
  ChatTitleGenerator,
  getDefaultChatTitleGenerator,
} from "./chatTitleGenerator.js";

// Main AI orchestrator class
export class AIOrchestrator {
  constructor(options = {}) {
    this.modelManager = options.modelManager || getDefaultModelManager();
    this.taskClassifier = options.taskClassifier || getDefaultTaskClassifier();
    this.promptManager = options.promptManager || getDefaultPromptManager();
    this.contextManager = options.contextManager || getDefaultContextManager();
    this.llmClient = options.llmClient || getDefaultLLMClient();
    this.chatTitleGenerator =
      options.chatTitleGenerator || getDefaultChatTitleGenerator();

    // Link components together
    this.taskClassifier.setModelManager(this.modelManager);
    this.contextManager.setModelManager(this.modelManager);

    // Set AI orchestrator in chat title generator to avoid circular dependency
    if (this.chatTitleGenerator && !this.chatTitleGenerator.aiOrchestrator) {
      this.chatTitleGenerator.setAIOrchestrator(this);
    }
  }

  // Main method to process a query
  async processQuery(queryText, chatHistory = null) {
    console.log("AI Orchestrator processing query:", queryText);

    // Step 1: Use local task classification only
    const classification = await this.taskClassifier.classifyQuery(queryText);
    console.log("Final query classification:", classification);

    // Step 2: Get prompt and parameters
    const maxTokens = this.promptManager.getTokenLimit(
      classification.task,
      classification.complexity
    );
    const temperature = this.promptManager.getTemperature(
      classification.task,
      classification.complexity,
      0
    );
    const systemPrompt = this.promptManager.getSystemPrompt(
      classification.task,
      maxTokens,
      classification.complexity
    );

    // Step 3: Process context
    const contextMessages = this.contextManager.processChatHistory(chatHistory);
    const modelConfig = this.modelManager.getModelConfig(classification.model);
    const selectedContext = this.contextManager.selectContextMessages(
      contextMessages,
      classification.model,
      modelConfig.contextConfig.maxContextMessages
    );
    const optimizedContext = this.contextManager.optimizeContext(
      selectedContext,
      classification.model,
      maxTokens
    );

    // Step 4: Build messages array
    const messages = this.contextManager.buildMessagesArray(
      systemPrompt,
      optimizedContext,
      queryText
    );

    // Step 5: Call LLM
    const result = await this.llmClient.callLLM({
      model: classification.model,
      messages,
      maxTokens,
      temperature,
      task: classification.task,
      complexity: classification.complexity,
      reason: classification.reason,
      contextMessages: optimizedContext,
    });

    // Add additional metadata
    result.metadata = {
      classification,
      contextStats: this.contextManager.getContextStats(
        optimizedContext,
        classification.model
      ),
      modelConfig: modelConfig,
      promptInfo: {
        maxTokens,
        temperature,
        systemPrompt: systemPrompt,
      },
    };

    return result;
  }

  // Generate chat title
  async generateChatTitle(firstMessage) {
    return await this.chatTitleGenerator.generateChatTitle(firstMessage);
  }

  // Update chat title dynamically
  async updateChatTitleDynamically(messages, currentTitle) {
    return await this.chatTitleGenerator.updateChatTitleDynamically(
      messages,
      currentTitle
    );
  }

  // Configure the orchestrator
  configure(options) {
    if (options.modelStrategy) {
      this.modelManager.setStrategy(options.modelStrategy);
    }

    if (options.customModelManager) {
      this.modelManager = options.customModelManager;
      this.taskClassifier.setModelManager(this.modelManager);
      this.contextManager.setModelManager(this.modelManager);
    }

    if (options.customTaskClassifier) {
      this.taskClassifier = options.customTaskClassifier;
    }

    if (options.customPromptManager) {
      this.promptManager = options.customPromptManager;
    }

    if (options.customContextManager) {
      this.contextManager = options.customContextManager;
    }

    if (options.customLLMClient) {
      this.llmClient = options.customLLMClient;
    }

    if (options.customChatTitleGenerator) {
      this.chatTitleGenerator = options.customChatTitleGenerator;
    }
  }

  // Get current configuration
  getConfiguration() {
    return {
      modelStrategy: this.modelManager.getStrategy(),
      availableModels: this.modelManager.getAvailableModels(),
      availableTasks: this.taskClassifier.getAvailableTasks(),
      availablePromptTypes: this.promptManager.getAvailablePromptTypes(),
    };
  }

  // Add custom model
  addCustomModel(modelId, config) {
    MODEL_REGISTRY[modelId] = config;
  }

  // Add custom task type
  addCustomTask(taskType, config) {
    TASK_TYPES[taskType] = config;
  }

  // Add custom system prompt
  addCustomPrompt(taskType, promptFunction) {
    this.promptManager.addSystemPrompt(taskType, promptFunction);
  }

  // Test model availability
  async testModel(modelId) {
    return await this.llmClient.testModel(modelId);
  }

  // Get cost estimate
  estimateCost(modelId, inputTokens, outputTokens = 0) {
    return this.modelManager.estimateCost(modelId, inputTokens, outputTokens);
  }
}

// Factory function to create AI orchestrator with different configurations
export function createAIOrchestrator(config = {}) {
  const options = {
    modelStrategy: config.modelStrategy || "BALANCED",
    customModelManager: config.customModelManager,
    customTaskClassifier: config.customTaskClassifier,
    customPromptManager: config.customPromptManager,
    customContextManager: config.customContextManager,
    customLLMClient: config.customLLMClient,
    customChatTitleGenerator: config.customChatTitleGenerator,
  };

  const orchestrator = new AIOrchestrator(options);

  if (config.modelStrategy) {
    orchestrator.configure({ modelStrategy: config.modelStrategy });
  }

  return orchestrator;
}

// Pre-configured orchestrators for common use cases
export const AIOrchestrators = {
  // Cost-optimized: prioritize cheaper models
  CostOptimized: () =>
    createAIOrchestrator({ modelStrategy: "COST_OPTIMIZED" }),

  // Quality-optimized: prioritize better models
  QualityOptimized: () =>
    createAIOrchestrator({ modelStrategy: "QUALITY_OPTIMIZED" }),

  // Speed-optimized: prioritize faster models
  SpeedOptimized: () =>
    createAIOrchestrator({ modelStrategy: "SPEED_OPTIMIZED" }),

  // Balanced: good balance of cost, quality, and speed
  Balanced: () => createAIOrchestrator({ modelStrategy: "BALANCED" }),
};

// Export all components for advanced usage
export {
  // Models
  ModelManager,
  MODEL_REGISTRY,
  MODEL_SELECTION_STRATEGIES,
  getDefaultModelManager,

  // Task Classification
  TaskClassifier,
  TASK_TYPES,
  TextComplexityAnalyzer,
  getDefaultTaskClassifier,

  // Prompts
  PromptManager,
  SYSTEM_PROMPTS,
  getDefaultPromptManager,

  // Context Management
  ContextManager,
  CONTEXT_STRATEGIES,
  getDefaultContextManager,

  // LLM Client
  LLMClient,
  getDefaultLLMClient,

  // Chat Title Generator
  ChatTitleGenerator,
  getDefaultChatTitleGenerator,
};

// Export default orchestrator instance
let _defaultAIOrchestrator = null;

export function getDefaultAIOrchestrator() {
  if (!_defaultAIOrchestrator) {
    _defaultAIOrchestrator = new AIOrchestrator();
  }
  return _defaultAIOrchestrator;
}

// For backward compatibility
export const defaultAIOrchestrator = getDefaultAIOrchestrator();

// Utility functions for API key management
export function setApiKey(provider, key) {
  getDefaultLLMClient().setApiKey(provider, key);
}

export function getApiKey(provider) {
  return getDefaultLLMClient().getApiKey(provider);
}

// Usage:
// import { setApiKey } from 'ai-lib';
// setApiKey('groq', 'YOUR_GROQCLOUD_API_KEY');
