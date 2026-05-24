import { jsPDF } from "jspdf";
import type { TopicCode, AlgorithmTopic } from "./pdf-data";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const FOOTER_Y = PAGE_H - 6;

interface State {
  doc: jsPDF;
  y: number;
  page: number;
}

function addFooter(state: State) {
  state.doc.setFont("helvetica", "normal");
  state.doc.setFontSize(7);
  state.doc.setTextColor(120, 120, 140);
  state.doc.text(
    `Compiler Design Lab  —  Page ${state.page}`,
    PAGE_W / 2,
    FOOTER_Y,
    { align: "center" }
  );
}

function newPage(state: State) {
  addFooter(state);
  state.doc.addPage();
  state.page++;
  state.y = MARGIN + 4;
}

function checkBreak(state: State, needed: number) {
  if (state.y + needed > FOOTER_Y - 4) newPage(state);
}

function coverPage(doc: jsPDF, subtitle: string) {
  doc.setFillColor(10, 15, 35);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Gradient bar
  doc.setFillColor(99, 102, 241);
  doc.rect(0, PAGE_H / 2 - 45, PAGE_W, 3, "F");
  doc.setFillColor(16, 185, 129);
  doc.rect(0, PAGE_H / 2 - 41, PAGE_W, 1, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.text("Compiler Design Lab", PAGE_W / 2, PAGE_H / 2 - 20, {
    align: "center",
  });

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(148, 163, 184);
  doc.text(subtitle, PAGE_W / 2, PAGE_H / 2, { align: "center" });

  // Topics line
  doc.setFontSize(9);
  doc.setTextColor(99, 102, 241);
  doc.text(
    "FIRST/FOLLOW · Left Recursion · LL(1) · LR(0) · LR(1) · SLR · LALR · Predictive",
    PAGE_W / 2,
    PAGE_H / 2 + 16,
    { align: "center" }
  );
}

function sectionHeader(state: State, title: string, badge?: string) {
  checkBreak(state, 22);

  // Background strip
  state.doc.setFillColor(24, 32, 52);
  state.doc.rect(MARGIN, state.y, CONTENT_W, 11, "F");

  // Accent bar
  state.doc.setFillColor(99, 102, 241);
  state.doc.rect(MARGIN, state.y, 3, 11, "F");

  // Title text
  state.doc.setFont("helvetica", "bold");
  state.doc.setFontSize(10);
  state.doc.setTextColor(230, 235, 255);
  state.doc.text(title, MARGIN + 6, state.y + 7.2);

  // Badge (filename or algo label)
  if (badge) {
    state.doc.setFont("courier", "normal");
    state.doc.setFontSize(7.5);
    state.doc.setTextColor(100, 190, 120);
    state.doc.text(badge, PAGE_W - MARGIN - 1, state.y + 7.2, {
      align: "right",
    });
  }

  state.y += 14;
}

function renderCode(state: State, code: string) {
  const lines = code.split("\n");
  const lineH = 3.15;
  const fontSize = 6.4;

  state.doc.setFontSize(fontSize);

  for (const rawLine of lines) {
    checkBreak(state, lineH + 0.5);
    state.doc.setFont("courier", "normal");

    // Syntax-aware colouring (basic)
    const trimmed = rawLine.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
      state.doc.setTextColor(100, 115, 100); // muted green for comments
    } else if (trimmed.startsWith("#")) {
      state.doc.setTextColor(160, 80, 200); // purple for preprocessor
    } else if (/^(int|char|void|return|if|else|for|while|do|struct|typedef|const)\b/.test(trimmed)) {
      state.doc.setTextColor(80, 140, 210); // blue for keywords
    } else {
      state.doc.setTextColor(45, 45, 55);
    }

    // Truncate lines that are too long for the page
    const maxChars = 105;
    const line = rawLine.length > maxChars ? rawLine.slice(0, maxChars - 2) + "…" : rawLine;

    state.doc.text(line, MARGIN + 2, state.y);
    state.y += lineH;
  }

  state.y += 3;
}

function algoSubHeader(state: State, title: string) {
  checkBreak(state, 10);
  state.doc.setFont("helvetica", "bold");
  state.doc.setFontSize(9);
  state.doc.setTextColor(99, 102, 241);
  state.doc.text(title, MARGIN + 2, state.y);
  state.y += 5.5;
}

function renderSteps(state: State, steps: string[]) {
  state.doc.setFont("helvetica", "normal");
  state.doc.setFontSize(9);

  steps.forEach((step, idx) => {
    checkBreak(state, 6);
    const label = `${idx + 1}.`;
    const text = `${label} ${step}`;
    const wrapped = state.doc.splitTextToSize(text, CONTENT_W - 10);
    wrapped.forEach((line: string, li: number) => {
      checkBreak(state, 5);
      state.doc.setTextColor(35, 40, 55);
      state.doc.text(li === 0 ? line : `   ${line}`, MARGIN + 6, state.y);
      state.y += 4.5;
    });
  });

  state.y += 2;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function downloadCCodesPdf() {
  const { C_CODE_TOPICS } = (await import("./pdf-data")) as {
    C_CODE_TOPICS: TopicCode[];
  };

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  coverPage(doc, "All C Program Implementations");
  doc.addPage();

  const state: State = { doc, y: MARGIN + 4, page: 2 };

  C_CODE_TOPICS.forEach((topic, i) => {
    if (i > 0) state.y += 4;
    checkBreak(state, 30);
    sectionHeader(state, `${i + 1}. ${topic.title}`, topic.filename);
    renderCode(state, topic.code);
  });

  addFooter(state);
  doc.save("compiler-design-c-codes.pdf");
}

export async function downloadAlgorithmsPdf() {
  const { ALGORITHM_TOPICS } = (await import("./pdf-data")) as {
    ALGORITHM_TOPICS: AlgorithmTopic[];
  };

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  coverPage(doc, "All Parsing Algorithms — Reference Guide");
  doc.addPage();

  const state: State = { doc, y: MARGIN + 4, page: 2 };

  ALGORITHM_TOPICS.forEach((topic, i) => {
    if (i > 0) state.y += 4;
    checkBreak(state, 28);
    sectionHeader(state, `${i + 1}. ${topic.title}`);

    topic.algorithms.forEach((algo) => {
      algoSubHeader(state, algo.title);
      renderSteps(state, algo.steps);
    });
  });

  addFooter(state);
  doc.save("compiler-design-algorithms.pdf");
}
