import { useState } from "react";
import { CornerDownRight } from "lucide-react";

interface RecommendedSuggestionsProps {
  suggestions: string[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function RecommendedSuggestions({
  suggestions,
  onSelect,
  disabled = false,
}: RecommendedSuggestionsProps) {
  const [clickedPrompt, setClickedPrompt] = useState<string | null>(null);

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const handleClick = (prompt: string) => {
    if (disabled || clickedPrompt) return;
    setClickedPrompt(prompt);
    onSelect(prompt);
  };

  return (
    <div className="mt-2 flex flex-col gap-0.5 w-full max-w-3xl">
      {suggestions.map((prompt, idx) => {
        const isClicked = clickedPrompt === prompt;
        return (
          <button
            key={`${idx}-${prompt}`}
            type="button"
            disabled={disabled || Boolean(clickedPrompt)}
            onClick={() => handleClick(prompt)}
            className={`group flex items-start gap-2.5 py-1.5 px-2 rounded-lg text-left transition-all cursor-pointer ${
              isClicked
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium"
                : "hover:bg-slate-100/90 dark:hover:bg-slate-800/70 active:scale-[0.99]"
            } ${clickedPrompt ? "opacity-60 cursor-not-allowed" : ""}`}
            title="Click to send follow-up"
          >
            <CornerDownRight
              size={15}
              className={`shrink-0 mt-0.5 transition-transform ${
                isClicked
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 dark:text-emerald-400/90 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 group-hover:translate-x-0.5"
              }`}
            />
            <span className="text-[13.5px] sm:text-sm font-medium leading-snug text-slate-700 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
              {prompt}
            </span>
          </button>
        );
      })}
    </div>
  );
}
