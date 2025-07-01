// Context Management Library
// This module handles conversation context optimization and token management

import { defaultModelManager } from "./models.js";

// Context selection strategies
export const CONTEXT_STRATEGIES = {
  RECENT: "recent", // Only the most recent messages
  SMART: "smart", // First message + recent messages
  COMPREHENSIVE: "comprehensive", // Full context with smart selection
  MINIMAL: "minimal", // Minimal context for cost efficiency
};

// Context manager class
export class ContextManager {
  constructor(modelManager = defaultModelManager) {
    this.modelManager = modelManager;
  }

  // Select context messages based on model and strategy
  selectContextMessages(messages, model, maxContextMessages) {
    if (!messages || messages.length === 0) return [];

    const config = this.modelManager.getModelConfig(model);
    const strategy = config.contextConfig.contextStrategy;

    switch (strategy) {
      case CONTEXT_STRATEGIES.RECENT:
        return this.selectRecentMessages(messages, maxContextMessages);

      case CONTEXT_STRATEGIES.SMART:
        return this.selectSmartMessages(messages, maxContextMessages);

      case CONTEXT_STRATEGIES.COMPREHENSIVE:
        return this.selectComprehensiveMessages(messages, maxContextMessages);

      case CONTEXT_STRATEGIES.MINIMAL:
        return this.selectMinimalMessages(messages, maxContextMessages);

      default:
        return this.selectRecentMessages(messages, maxContextMessages);
    }
  }

  // Select only recent messages
  selectRecentMessages(messages, maxContextMessages) {
    return messages.slice(-maxContextMessages);
  }

  // Select first message + recent messages
  selectSmartMessages(messages, maxContextMessages) {
    if (messages.length <= maxContextMessages) {
      return messages;
    }

    const recentMessages = messages.slice(-maxContextMessages + 1);
    const firstMessage = messages[0];
    return [firstMessage, ...recentMessages];
  }

  // Select comprehensive context with smart distribution
  selectComprehensiveMessages(messages, maxContextMessages) {
    if (messages.length <= maxContextMessages) {
      return messages;
    }

    // Take first message, middle message, and recent messages
    const first = messages[0];
    const middle = messages[Math.floor(messages.length / 2)];
    const recent = messages.slice(-maxContextMessages + 2);
    return [first, middle, ...recent];
  }

  // Select minimal context for cost efficiency
  selectMinimalMessages(messages, maxContextMessages) {
    const minimalCount = Math.min(maxContextMessages, 2);
    return messages.slice(-minimalCount);
  }

  // Optimize context to stay within token limits
  optimizeContext(contextMessages, model, maxTokens) {
    const config = this.modelManager.getModelConfig(model);
    const maxContextTokens = Math.floor(maxTokens * 0.7); // Reserve 30% for response

    let totalTokens = 0;
    const optimizedMessages = [];

    // Start from most recent messages and work backwards
    for (let i = contextMessages.length - 1; i >= 0; i--) {
      const message = contextMessages[i];
      const messageTokens = this.estimateTokenCount(message.content);

      if (totalTokens + messageTokens <= maxContextTokens) {
        optimizedMessages.unshift(message);
        totalTokens += messageTokens;
      } else {
        // If we can't fit the full message, truncate it
        const remainingTokens = maxContextTokens - totalTokens;
        const maxChars = remainingTokens * 4;

        if (maxChars > 100) {
          // Only add if we have meaningful space
          const truncatedMessage = {
            ...message,
            content: message.content.substring(0, maxChars) + "...",
          };
          optimizedMessages.unshift(truncatedMessage);
        }
        break;
      }
    }

    return optimizedMessages;
  }

  // Estimate token count for text
  estimateTokenCount(text) {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  // Build messages array for LLM API
  buildMessagesArray(systemPrompt, contextMessages, userQuery) {
    const messages = [
      { role: "system", content: systemPrompt },
      ...contextMessages,
      { role: "user", content: userQuery },
    ];

    return messages;
  }

  // Process chat history into context messages
  processChatHistory(chatHistory) {
    const contextMessages = [];

    if (chatHistory && chatHistory.messages) {
      for (const msg of chatHistory.messages) {
        contextMessages.push({ role: "user", content: msg.user });
        if (msg.response) {
          contextMessages.push({ role: "assistant", content: msg.response });
        }
      }
    }

    return contextMessages;
  }

  // Get context statistics
  getContextStats(contextMessages, model) {
    const totalTokens = contextMessages.reduce(
      (sum, msg) => sum + this.estimateTokenCount(msg.content),
      0
    );

    const config = this.modelManager.getModelConfig(model);
    const maxContextTokens = config.contextConfig.maxTokens;
    const usagePercentage = (totalTokens / maxContextTokens) * 100;

    return {
      messageCount: contextMessages.length,
      totalTokens,
      maxContextTokens,
      usagePercentage,
      strategy: config.contextConfig.contextStrategy,
    };
  }

  // Set model manager
  setModelManager(modelManager) {
    this.modelManager = modelManager;
  }
}

// Export default context manager instance
let _defaultContextManager = null;

export function getDefaultContextManager() {
  if (!_defaultContextManager) {
    _defaultContextManager = new ContextManager();
  }
  return _defaultContextManager;
}

// For backward compatibility
export const defaultContextManager = getDefaultContextManager();
