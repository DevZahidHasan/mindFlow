"use client";

import * as React from "react";

export interface TextSplitProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  delayMs?: number; // Base delay before character entry (ms)
}

/**
 * An accessible text-splitting animation component.
 * Tracks viewport intersections so that the character crawl only begins playing
 * when the text is actually scrolled into view.
 */
export const TextSplit: React.FC<TextSplitProps> = ({
  text,
  delayMs = 0,
  className = "",
  ...props
}) => {
  const [shouldAnimate, setShouldAnimate] = React.useState(true);
  const [inView, setInView] = React.useState(false);
  const elementRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    // Disable animations under prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setShouldAnimate(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: "-20% 0px -20% 0px" }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
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
    <span ref={elementRef} className={`inline-block ${className}`} {...props}>
      {/* Screen Reader Only (sr-only) tag to preserve standard readability */}
      <span className="sr-only">{text}</span>

      {/* Decorative visual spans, hidden from accessibility tools */}
      {inView && (
        <span aria-hidden="true" className="inline-flex flex-wrap gap-x-[0.25em]">
          {words.map((word, wordIdx) => {
            const wordChars = Array.from(word);
            return (
              <span key={`word-${wordIdx}`} className="inline-block whitespace-nowrap">
                {wordChars.map((char, charIdx) => {
                  const delay = delayMs + charCounter * 60; // 60ms deliberate stagger per character
                  charCounter++;
                  return (
                    <span
                      key={`char-${charIdx}`}
                      style={{
                        animationDelay: `${delay}ms`,
                        animationFillMode: "both",
                      }}
                      className="inline-block animate-[fadeInUp_1s_cubic-bezier(0.16,1,0.3,1)]"
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </span>
      )}
    </span>
  );
};
export default TextSplit;
