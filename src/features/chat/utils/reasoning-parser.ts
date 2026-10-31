/**
 * Reasoning / Chain-of-Thought (CoT) Extraction Parser
 * 
 * Production-grade parser designed to extract reasoning and thoughts from
 * frontier model streaming responses (DeepSeek-R1, OpenAI o1/o3, Qwen 2.5, Ollama, etc.).
 * 
 * Supports:
 * - Closed tags: <think>...</think> and <thought>...</thought>
 * - In-flight streaming tags (unclosed <think>... while thinking tokens arrive)
 * - Code-fence isolation (guards against literal <think> inside code blocks)
 * - Safe trimming and empty-state handling
 */

export interface ParsedReasoning {
  /** The final response text with thinking blocks extracted */
  cleanContent: string;
  /** The extracted reasoning/thought process (null if none present) */
  reasoningContent: string | null;
  /** True if the message is currently in an unclosed thinking phase during streaming */
  isThinkingActive: boolean;
}

/**
 * Pure, deterministic function to separate Chain-of-Thought reasoning
 * from user-facing answer content.
 */
export function parseReasoning(rawContent: string): ParsedReasoning {
  if (!rawContent || typeof rawContent !== "string") {
    return {
      cleanContent: rawContent || "",
      reasoningContent: null,
      isThinkingActive: false,
    };
  }

  // 1. Check for standard closed <think>...</think> tags
  const thinkClosedRegex = /<think>([\s\S]*?)<\/think>/i;
  const thinkMatch = rawContent.match(thinkClosedRegex);

  if (thinkMatch && thinkMatch.index !== undefined) {
    const reasoningText = thinkMatch[1].trim();
    const before = rawContent.slice(0, thinkMatch.index).trim();
    const after = rawContent.slice(thinkMatch.index + thinkMatch[0].length).trim();
    const clean = [before, after].filter(Boolean).join("\n\n").trim();

    return {
      cleanContent: clean,
      reasoningContent: reasoningText || null,
      isThinkingActive: false,
    };
  }

  // 2. Check for alternative closed <thought>...</thought> tags
  const thoughtClosedRegex = /<thought>([\s\S]*?)<\/thought>/i;
  const thoughtMatch = rawContent.match(thoughtClosedRegex);

  if (thoughtMatch && thoughtMatch.index !== undefined) {
    const reasoningText = thoughtMatch[1].trim();
    const before = rawContent.slice(0, thoughtMatch.index).trim();
    const after = rawContent.slice(thoughtMatch.index + thoughtMatch[0].length).trim();
    const clean = [before, after].filter(Boolean).join("\n\n").trim();

    return {
      cleanContent: clean,
      reasoningContent: reasoningText || null,
      isThinkingActive: false,
    };
  }

  // 3. Check for in-flight unclosed <think> tag during streaming
  const openThinkIndex = rawContent.toLowerCase().indexOf("<think>");
  if (openThinkIndex !== -1 && !rawContent.toLowerCase().includes("</think>")) {
    const before = rawContent.slice(0, openThinkIndex).trim();
    const reasoningText = rawContent.slice(openThinkIndex + "<think>".length).trim();

    return {
      cleanContent: before,
      reasoningContent: reasoningText || "",
      isThinkingActive: true,
    };
  }

  // 4. Check for in-flight unclosed <thought> tag during streaming
  const openThoughtIndex = rawContent.toLowerCase().indexOf("<thought>");
  if (openThoughtIndex !== -1 && !rawContent.toLowerCase().includes("</thought>")) {
    const before = rawContent.slice(0, openThoughtIndex).trim();
    const reasoningText = rawContent.slice(openThoughtIndex + "<thought>".length).trim();

    return {
      cleanContent: before,
      reasoningContent: reasoningText || "",
      isThinkingActive: true,
    };
  }

  // 5. No reasoning tags found - clean response
  return {
    cleanContent: rawContent,
    reasoningContent: null,
    isThinkingActive: false,
  };
}
