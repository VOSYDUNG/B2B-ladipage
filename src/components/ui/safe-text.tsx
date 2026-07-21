import React from 'react';

/**
 * For Lao language, browsers often break lines mid-phrase (dictionary-based breaking).
 * This component splits text by spaces and wraps each phrase in `whitespace-nowrap`,
 * forcing the browser to only break lines AT the explicit spaces, keeping phrases together.
 */
export function SafeText({ text }: { text: string }) {
  if (typeof text !== 'string') return <>{text}</>;
  
  return (
    <>
      {text.split(' ').map((word, i, arr) => (
        <React.Fragment key={i}>
          <span className="whitespace-nowrap">{word}</span>
          {i !== arr.length - 1 && ' '}
        </React.Fragment>
      ))}
    </>
  );
}
