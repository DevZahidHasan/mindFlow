export const AI_CONFIG = {
  // Provider configuration
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  
  // Model configurations
  MODELS: {
    CHAT: process.env.AI_LLM_MODEL || "openai/gpt-oss-20b",
  },

  // Chunking settings
  CHUNKING: {
    MAX_TOKENS: 500, // Safe chunk size limit
    OVERLAP_TOKENS: 50, // Context retention between chunks
  }
};

export const requireAiSecrets = () => {
  if (!AI_CONFIG.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY environment variable. AI LLM features are disabled.");
  }
};
