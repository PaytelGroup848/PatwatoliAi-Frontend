/**
 * Speech Text Sanitizer
 * 
 * Sanitizes markdown, source citations, URLs, and code blocks into natural,
 * speakable prose for browser SpeechSynthesis.
 * 
 * Prevents painful phonetic recitation of code brackets, backticks,
 * URLs, and markdown punctuation.
 */

export function sanitizeTextForSpeech(rawContent: string): string {
  if (!rawContent || typeof rawContent !== "string") {
    return "";
  }

  let text = rawContent;

  // 1. Replace multi-line code blocks with a natural speech transition
  text = text.replace(/```[\s\S]*?```/g, " Code component available in chat. ");

  // 2. Remove markdown images: ![alt](url)
  text = text.replace(/!\[.*?\]\(.*?\)/g, "");

  // 3. Flatten markdown links: [Label](url) -> Label
  text = text.replace(/\[([^\]]+)\]\(https?:\/\/[^\s\)]+\)/g, "$1");

  // 4. Remove bare URLs (avoid reading http colon slash slash...)
  text = text.replace(/https?:\/\/[^\s\)]+/gi, "");

  // 5. Strip numeric citation brackets: [1], [2], [1, 2], [1][2]
  text = text.replace(/\[\d+(?:[,\s]*\d+)*\]/g, "");

  // 6. Strip markdown headings (#, ##, ###)
  text = text.replace(/^#{1,6}\s+/gm, "");

  // 7. Strip bold, italic, and strikethrough markdown markers: **text**, *text*, ~~text~~
  text = text.replace(/[*_~]{1,3}(.*?)[*_~]{1,3}/g, "$1");

  // 8. Strip inline code backticks: `const x` -> const x
  text = text.replace(/`([^`]+)`/g, "$1");

  // 9. Strip list bullets and blockquote symbols
  text = text.replace(/^[-*+•]\s+/gm, "");
  text = text.replace(/^>\s*/gm, "");

  // 10. Strip any HTML tags that might be present
  text = text.replace(/<[^>]*>/g, "");

  // 11. Normalize duplicate whitespace and newlines into natural pauses
  text = text.replace(/\r?\n+/g, ". ");
  text = text.replace(/\s+/g, " ");

  // 12. Clean up awkward multiple periods: ".. " -> ". "
  text = text.replace(/\.{2,}/g, ".");

  return text.trim();
}
