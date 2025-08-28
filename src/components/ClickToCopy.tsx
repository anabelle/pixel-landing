'use client';

import { useState } from 'react';

interface ClickToCopyProps {
  text: string;
  children: React.ReactNode;
  className?: string;
}

export default function ClickToCopy({ text, children, className = '' }: ClickToCopyProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      className={`relative group cursor-pointer transition-all duration-200 ${className}`}
      title="Click to copy"
    >
      {children}
      <span className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs bg-black text-green-400 border border-green-400 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap ${
        copied ? 'opacity-100' : ''
      }`}>
        {copied ? 'Copied!' : 'Click to copy'}
      </span>
    </button>
  );
}