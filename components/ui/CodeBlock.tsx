"use client";
import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { cn, copyToClipboard, downloadCode } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}

export function CodeBlock({
  code,
  language = "c",
  filename,
  showLineNumbers = true,
  highlightLines = [],
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split("\n");

  return (
    <div className={cn("rounded-xl overflow-hidden border border-white/8", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/70" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          {filename && (
            <span className="text-xs text-slate-400 font-mono">{filename}</span>
          )}
          {!filename && (
            <span className="text-xs text-slate-500 uppercase tracking-wider">{language}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadCode(code, filename ?? `program.${language}`)}
            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Download"
          >
            <Download size={14} />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Copy"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Code */}
      <div className="bg-[#0d0d1a] overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed font-mono">
          {lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                highlightLines.includes(i + 1) && "bg-indigo-500/10 -mx-4 px-4 border-l-2 border-indigo-500"
              )}
            >
              {showLineNumbers && (
                <span className="select-none text-slate-600 w-8 shrink-0 text-right mr-4 text-xs pt-0.5">
                  {i + 1}
                </span>
              )}
              <SyntaxLine code={line} language={language} />
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

function SyntaxLine({ code, language }: { code: string; language: string }) {
  if (language !== "c" && language !== "cpp") {
    return <span className="text-slate-300">{code}</span>;
  }

  const tokens = tokenizeC(code);
  return (
    <span>
      {tokens.map((token, i) => (
        <span key={i} style={{ color: token.color }}>
          {token.text}
        </span>
      ))}
    </span>
  );
}

interface Token { text: string; color: string; }

function tokenizeC(line: string): Token[] {
  const keywords = new Set([
    "int","char","float","double","void","if","else","while","for","do",
    "return","break","continue","struct","typedef","include","define",
    "printf","scanf","main","NULL","sizeof","switch","case","default",
    "const","static","extern","long","short","unsigned","signed",
  ]);

  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // Comment
    if (line[i] === "/" && line[i + 1] === "/") {
      tokens.push({ text: line.slice(i), color: "#546e7a" });
      break;
    }
    // Block comment start
    if (line[i] === "/" && line[i + 1] === "*") {
      let j = i + 2;
      while (j < line.length - 1 && !(line[j] === "*" && line[j + 1] === "/")) j++;
      tokens.push({ text: line.slice(i, j + 2), color: "#546e7a" });
      i = j + 2;
      continue;
    }
    // String
    if (line[i] === '"') {
      let j = i + 1;
      while (j < line.length && line[j] !== '"') j++;
      tokens.push({ text: line.slice(i, j + 1), color: "#c3e88d" });
      i = j + 1;
      continue;
    }
    // Char
    if (line[i] === "'") {
      let j = i + 1;
      while (j < line.length && line[j] !== "'") j++;
      tokens.push({ text: line.slice(i, j + 1), color: "#f78c6c" });
      i = j + 1;
      continue;
    }
    // Number
    if (/\d/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\d.]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), color: "#f78c6c" });
      i = j;
      continue;
    }
    // Preprocessor
    if (line[i] === "#") {
      let j = i + 1;
      while (j < line.length && /\w/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), color: "#c792ea" });
      i = j;
      continue;
    }
    // Identifier / keyword
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /\w/.test(line[j])) j++;
      const word = line.slice(i, j);
      const isKw = keywords.has(word);
      tokens.push({ text: word, color: isKw ? "#c792ea" : "#82aaff" });
      i = j;
      continue;
    }
    // Operator/punctuation
    if (/[+\-*/%=<>!&|^~{}[\]();,.]/.test(line[i])) {
      tokens.push({ text: line[i], color: "#89ddff" });
      i++;
      continue;
    }
    // Whitespace and anything else
    tokens.push({ text: line[i], color: "#ecedff" });
    i++;
  }

  return tokens;
}
