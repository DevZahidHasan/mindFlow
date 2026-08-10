"use client";

import * as React from "react";

export interface TextSplitProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  delayMs?: number; // Base delay before character entry (ms)
}

/**
 * An accessible text-splitting animation component.
 * Wraps individual words in whitespace-nowrap inline-blocks to prevent letters
 * from breaking mid-word on narrow viewports, while retaining screen reader capability.
 */
export const TextSplit: React.FC<TextSplitProps> = ({
  text,
  delayMs = 0,
  className = "",
  ...props
}) => {
  const [shouldAnimate, setShouldAnimate] = React.useState(true);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldAnimate(!mediaQuery.matches);
  }, []);

  if (!shouldAnimate) {
    return (
      <span className={className} {...props}>
        {text}
      </span>
    );
  }

  // Split text by words to prevent internal character breaking
  const words = text.split(" ");
  let charCounter = 0;

  return (
    <span className={`inline-block ${className}`} {...props}>
      {/* Screen Reader Only (sr-only) tag to preserve standard readability */}
      <span className="sr-only">{text}</span>

      {/* Decorative visual spans, hidden from accessibility tools */}
      <span aria-hidden="true" className="inline-flex flex-wrap gap-x-[0.25em]">
        {words.map((word, wordIdx) => {
          const wordChars = Array.from(word);
          return (
            <span key={`word-${wordIdx}`} className="inline-block whitespace-nowrap">
              {wordChars.map((char, charIdx) => {
                const delay = delayMs + charCounter * 20; // 20ms stagger per character
                charCounter++;
                return (
                  <span
                    key={`char-${charIdx}`}
                    style={{
                      animationDelay: `${delay}ms`,
                      animationFillMode: "both",
                    }}
                    className="inline-block animate-[fadeInUp_0.4s_cubic-bezier(0.16,1,0.3,1)]"
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </span>
  );
};
export default TextSplit;
