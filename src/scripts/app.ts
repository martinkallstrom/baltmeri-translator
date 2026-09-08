type Token = {
  text: string; lemma?: string; gloss?: string; pos?: string; features?: string; stem?: string; steps?: string[];
  origin?: string; note?: string;
  derivation?: {
    rule: string; derived: string; form: string; matchesManual: boolean | null; family?: string; decidedBy?: string;
    gathered: { lang: string; raw: string; stem: string; skeleton: string[] }[];
    hanse?: { skeleton: string[]; families: string[]; supporters: string[]; slots: { perFamily: { family: string; value: string; by: string }[]; tie?: { decider: string; queueBefore: string[] } }[] };
    domain?: { domain: string; family: string; chosen: string };
    vote?: { tally: { stem: string; families: string[] }[]; tie?: { decider: string; queueBefore: string[] } };
    fallback?: { winner: string; queueBefore: string[] };
    collision?: { clashedWith: string; runnerUp: string | null };
    notes: string[]; queueBefore: string[]; queueAfter: string[];
  };
};
type Forward = { direction: "forward"; translation: string; tokens: Token[]; trace: string; detectedLanguage: string; notes: string; unknown: string[]; newWords: { id: string; form: string }[]; cachedAnalysis: boolean };
type Reverse = { direction: "reverse"; translation: string; tutorial: string; tokens: { text: string; analyses: { lemma: string; gloss: string; pos: string; features: string }[] }[] };

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const src = $<HTMLTextAreaElement>("src");
const out = $<HTMLDivElement>("out");
const statusEl = $<HTMLDivElement>("status");
const tutorialEl = $<HTMLDivElement>("tutorial");
const traceEl = $<HTMLElement>("trace");
const fromSel = $<HTMLSelectElement>("from");
const toSel = $<HTMLSelectElement>("to");
const toFixed = $<HTMLDivElement>("to-fixed");
const audioBox = $<HTMLDivElement>("audio");
const speakBtn = $<HTMLButtonElement>("speak");
const copyBtn = $<HTMLButtonElement>("copy");
const busy = $<HTMLDivElement>("busy");
const meta = $<HTMLSpanElement>("meta");

const LANG_NAMES: Record<string, string> = { fi: "Finnish", et: "Estonian", lv: "Latvian", lt: "Lithuanian", pl: "Polish", ru: "Russian", sv: "Swedish", da: "Danish", de: "German" };
let reversed = false; // false: X → Baltmeri; true: Baltmeri → X
let current: Forward | Reverse | null = null;
let lastKey = "";
let timer: number | undefined;
let inflight: AbortController | null = null;

function esc(s: string) { return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!); }

/** Tiny Markdown: paragraphs, bullets, bold, italics, code. */
function md(s: string): string {
  const inline = (t: string) => esc(t)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  const lines = s.replace(/\r/g, "").split("\n");
  let html = "", inList = false, para: string[] = [];
  const flush = () => { if (para.length) { html += `<p>${inline(para.join(" "))}</p>`; para = []; } };
  for (const raw of lines) {
    const line = raw.trim();
    const m = line.match(/^[-*•]\s+(.*)$/);
    if (m) { flush(); if (!inList) { html += "<ul>"; inList = true; } html += `<li>${inline(m[1])}</li>`; continue; }
    if (inList) { html += "</ul>"; inList = false; }
    if (!line) { flush(); continue; }
    if (/^#{1,6}\s/.test(line)) { flush(); html += `<p><strong>${inline(line.replace(/^#+\s/, ""))}</strong></p>`; continue; }
    para.push(line);
  }
  if (inList) html += "</ul>";
  flush();
  return html;
}

function setBusy(b: boolean) { busy.hidden = !b; $("go").toggleAttribute("disabled", b); }
function setStatus(msg: string, err = false) { statusEl.textContent = msg; statusEl.className = "status" + (err ? " err" : ""); }

function renderDirection() {
  const fromSlot = $("from-slot"), toSlot = $("to-slot");
  if (reversed) {
    fromSlot.innerHTML = `<div class="lang-fixed">Baltmeri</div>`;
    toFixed.hidden = true; toSel.hidden = false;
    src.placeholder = "Type Baltmeri… e.g. Peleekhüljei odpočiv kaljuil suvil.";
    out.classList.add("small");
  } else {
    fromSlot.innerHTML = ""; fromSlot.appendChild(fromSel);
    toFixed.hidden = false; toSel.hidden = true;
    src.placeholder = "Type something… e.g. Grey seals rest on the rocks in summer.";
    out.classList.remove("small");
  }
  void toSlot;
}

function swap() {
  reversed = !reversed;
  const prev = current?.translation ?? "";
  renderDirection();
  if (prev && !prev.startsWith("[")) { src.value = prev; }
  clearOutput();
  schedule(0);
}

function clearOutput() {
  out.innerHTML = `<span class="placeholder">${reversed ? "Your translation appears here." : "Baltmeri appears here — click a word to see how it was decided."}</span>`;
  tutorialEl.innerHTML = `<p class="muted">${reversed ? "The legend will show how each Baltmeri ending was read." : "The seal is thinking…"}</p>`;
  traceEl.hidden = true;
  audioBox.hidden = true; audioBox.innerHTML = "";
  speakBtn.disabled = true; copyBtn.disabled = true;
  meta.textContent = "";
  current = null;
}

function schedule(delay = 1100) {
  window.clearTimeout(timer);
  timer = window.setTimeout(translate, delay);
}

async function translate() {
  const text = src.value.trim();
  const from = reversed ? "bm" : fromSel.value;
  const to = reversed ? toSel.value : "bm";
  const key = `${from}|${to}|${text}`;
  if (!text) { clearOutput(); tutorialEl.innerHTML = `<p class="muted">Translate something and the seal will explain which rule decided each word, who won the vote, and how the Visby Queue broke the ties.</p>`; lastKey = ""; return; }
  if (key === lastKey) return;
  lastKey = key;
  inflight?.abort();
  inflight = new AbortController();
  setBusy(true); setStatus(reversed ? "Reading the endings…" : "Asking nine languages…");
  try {
    const res = await fetch("/api/translate.json", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, from, to }), signal: inflight.signal });
    const data = (await res.json()) as (Forward | Reverse) & { error?: string };
    if (!res.ok) throw new Error(data.error ?? "Translation failed.");
    current = data;
    if (data.direction === "forward") showForward(data as Forward, text, from);
    else showReverse(data as Reverse);
  } catch (e) {
    if ((e as Error).name === "AbortError") return;
    setStatus((e as Error).message, true);
    tutorialEl.innerHTML = `<p class="muted">Nothing to explain yet.</p>`;
  } finally {
    setBusy(false);
  }
}

function showForward(d: Forward, source: string, from: string) {
  out.innerHTML = "";
  d.tokens.forEach((t, i) => {
    if (!t.text) return;
    if (/^[.,;:!?]$/.test(t.text)) { out.append(t.text); return; }
    if (out.childNodes.length) out.append(" ");
    const span = document.createElement("span");
    span.className = "w" + (t.origin === "new" ? " new" : "") + (t.origin === "unknown" ? " unknown" : "");
    span.textContent = t.text;
    span.title = t.lemma ? `${t.lemma}${t.features ? " · " + t.features : ""}` : t.pos ?? "";
    span.dataset.i = String(i);
    span.addEventListener("click", () => { out.querySelectorAll(".w.active").forEach((x) => x.classList.remove("active")); span.classList.add("active"); showTrace(t); });
    out.append(span);
  });
  const bits: string[] = [];
  if (d.detectedLanguage && from === "auto") bits.push(`detected ${d.detectedLanguage}`);
  if (d.newWords.length) bits.push(`${d.newWords.length} new word${d.newWords.length > 1 ? "s" : ""} derived`);
  if (d.unknown.length) bits.push(`${d.unknown.length} unknown`);
  setStatus(d.notes || "");
  meta.textContent = bits.join(" · ");
  speakBtn.disabled = false; copyBtn.disabled = false;
  audioBox.hidden = true; audioBox.innerHTML = "";
  traceEl.hidden = true;
  tutorialEl.innerHTML = `<p class="muted">The seal is writing the legend…</p>`;
  loadTutorial(source, from, d);
}

async function loadTutorial(source: string, from: string, d: Forward) {
  try {
    const res = await fetch("/api/tutorial.json", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ source, sourceLang: from, baltmeri: d.translation, trace: d.trace }) });
    const data = (await res.json()) as { tutorial: string; error?: string };
    if (current !== d) return;
    if (!res.ok) throw new Error(data.error);
    tutorialEl.innerHTML = md(data.tutorial);
  } catch (e) {
    if (current === d) tutorialEl.innerHTML = `<p class="muted">The legend could not be written: ${esc((e as Error).message ?? "unknown error")}</p>`;
  }
}

function showReverse(d: Reverse) {
  out.textContent = d.translation;
  tutorialEl.innerHTML = md(d.tutorial);
  const unknown = d.tokens.filter((t) => /\p{L}/u.test(t.text) && t.analyses.length === 0).map((t) => t.text);
  setStatus(unknown.length ? `Unknown to the lexicon: ${unknown.join(", ")}` : "");
  meta.textContent = "";
  copyBtn.disabled = false; speakBtn.disabled = true;
  audioBox.hidden = true; audioBox.innerHTML = "";
  traceEl.hidden = true;
}

function showTrace(t: Token) {
  const d = t.derivation;
  let html = `<button class="btn ghost close" id="trace-close">Close</button><h3>${esc(t.text)}<small>${esc(t.lemma ?? "")}${t.gloss ? " · " + esc(t.gloss) : ""}${t.pos ? " · " + esc(t.pos) : ""}</small></h3>`;
  const tags: string[] = [];
  if (t.features) tags.push(`<span class="tag">${esc(t.features)}</span>`);
  if (t.stem) tags.push(`<span class="tag">stem ${esc(t.stem)}</span>`);
  if (d) {
    tags.push(`<span class="tag">${{ hanse: "Rule 1 · Hanse", domain: "Rule 2 · Domain", vote: "Rule 3 · Family vote", fallback: "Rule 4 · Fallback", fixed: "Fixed" }[d.rule] ?? d.rule}</span>`);
    if (d.family) tags.push(`<span class="tag">${esc(d.family)}</span>`);
    if (d.decidedBy) tags.push(`<span class="tag">decided by ${LANG_NAMES[d.decidedBy] ?? d.decidedBy}</span>`);
    if (d.matchesManual === false) tags.push(`<span class="tag warn">manual decree · rules alone gave “${esc(d.derived)}”</span>`);
    if (d.matchesManual === true) tags.push(`<span class="tag">reproduces the manual</span>`);
    if (d.collision) tags.push(`<span class="tag warn">collision with “${esc(d.collision.clashedWith)}”</span>`);
  }
  if (t.origin === "new") tags.push(`<span class="tag warn">new word, derived now</span>`);
  html += `<div>${tags.join("")}</div>`;
  if (d?.gathered?.length) {
    const winners = new Set<string>();
    if (d.hanse) d.hanse.supporters.forEach((l) => winners.add(l));
    if (d.domain) winners.add(d.domain.chosen);
    if (d.decidedBy) winners.add(d.decidedBy);
    html += `<div class="grid">${d.gathered.map((g) => `<div class="src${winners.has(g.lang) ? " win" : ""}"><b>${LANG_NAMES[g.lang] ?? g.lang}</b>${esc(g.raw)} → <span class="stem">${esc(g.stem)}</span> <span class="sk">${g.skeleton.join("-")}</span></div>`).join("")}</div>`;
    if (d.hanse) html += `<p>Shared skeleton <code>${d.hanse.skeleton.join("-")}</code> in ${d.hanse.families.join(" + ")}. Ballots: ${d.hanse.slots[0]?.perFamily.map((p) => `${p.family} “${esc(p.value)}”`).join(", ")}.${d.hanse.slots[0]?.tie ? ` Tie → Visby Queue → ${LANG_NAMES[d.hanse.slots[0].tie.decider]} <span class="queue">(${d.hanse.slots[0].tie.queueBefore.join(" › ")})</span>` : ""}</p>`;
    if (d.domain) html += `<p>No shared skeleton. Domain <b>${esc(d.domain.domain)}</b> belongs to ${d.domain.family}; ${LANG_NAMES[d.domain.chosen]} ranks first in that family.</p>`;
    if (d.vote) html += `<p>Family vote: ${d.vote.tally.map((x) => `“${esc(x.stem)}” (${x.families.join(" + ")})`).join(", ")}.${d.vote.tie ? ` Tie → Visby Queue → ${LANG_NAMES[d.vote.tie.decider]} <span class="queue">(${d.vote.tie.queueBefore.join(" › ")})</span>` : ""}</p>`;
    if (d.fallback) html += `<p>Every family abstained. Fallback to the queue head with a form: ${LANG_NAMES[d.fallback.winner]} <span class="queue">(${d.fallback.queueBefore.join(" › ")})</span></p>`;
    if (d.queueBefore.join() !== d.queueAfter.join()) html += `<p class="queue">Queue after: ${d.queueAfter.join(" › ")}</p>`;
  }
  const notes = [...(d?.notes ?? []), ...(t.steps?.map((s) => "Repair " + s) ?? []), ...(t.note ? [t.note] : [])];
  if (notes.length) html += `<ul>${notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>`;
  traceEl.innerHTML = html;
  traceEl.hidden = false;
  $("trace-close").addEventListener("click", () => { traceEl.hidden = true; out.querySelectorAll(".w.active").forEach((x) => x.classList.remove("active")); });
  traceEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function speak() {
  if (!current || current.direction !== "forward") return;
  const text = current.translation;
  speakBtn.disabled = true;
  audioBox.hidden = false;
  audioBox.innerHTML = `<span class="muted">Warming up the voice…</span>`;
  try {
    const res = await fetch("/api/speak", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) });
    if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "Voice synthesis failed.");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const name = (res.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1]) ?? "baltmeri.mp3";
    audioBox.innerHTML = "";
    const audio = document.createElement("audio");
    audio.controls = true; audio.src = url; audio.autoplay = true;
    const dl = document.createElement("a");
    dl.className = "btn ghost dl"; dl.href = url; dl.download = name; dl.textContent = "Download MP3";
    audioBox.append(audio, dl);
  } catch (e) {
    audioBox.innerHTML = `<span class="status err">${esc((e as Error).message)}</span>`;
  } finally {
    speakBtn.disabled = false;
  }
}

src.addEventListener("input", () => { $("count").textContent = String(src.value.length); schedule(); });
$("go").addEventListener("click", () => { lastKey = ""; translate(); });
$("swap").addEventListener("click", swap);
fromSel.addEventListener("change", () => { lastKey = ""; schedule(0); });
toSel.addEventListener("change", () => { lastKey = ""; schedule(0); });
speakBtn.addEventListener("click", speak);
copyBtn.addEventListener("click", async () => { if (current) { await navigator.clipboard.writeText(current.translation); setStatus("Copied."); } });
document.addEventListener("keydown", (e) => {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key === "Enter") { e.preventDefault(); lastKey = ""; translate(); }
  if (mod && e.shiftKey && (e.key === "S" || e.key === "s")) { e.preventDefault(); swap(); }
});
renderDirection();
