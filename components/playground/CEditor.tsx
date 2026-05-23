"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function CEditor({ value, onChange }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = value.substring(0, start) + "    " + value.substring(end);
      onChange(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4;
      });
    }
  };

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      spellCheck={false}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 400,
        background: "transparent",
        color: "#cdd6f4",
        fontFamily: "JetBrains Mono, Fira Code, monospace",
        fontSize: 13,
        lineHeight: 1.6,
        padding: 12,
        border: "none",
        outline: "none",
        resize: "none",
        whiteSpace: "pre",
        overflowWrap: "normal",
        overflowX: "auto",
      }}
    />
  );
}
