import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { client } from "@/lib/edgespark";

const MAX_MESSAGES = 20;

type Msg = { role: "user" | "bot"; text: string };

export default function DifyChat() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);
  const conversationId = useRef("");
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    client.api
      .fetch("/api/public/dify/health")
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((j) => {
        if (!cancelled) setEnabled(!!j.enabled);
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (enabled === null || enabled === false) return null; // silent: don't render without key or on failure

  const productSlug = (location.pathname.match(/^\/products\/([^/]+)/) || [])[1] || "";

  async function send() {
    const q = input.trim();
    if (!q || busy || count >= MAX_MESSAGES) return;
    setBusy(true);
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    try {
      const res = await client.api.fetch("/api/public/dify/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, productSlug, conversationId: conversationId.current }),
      });
      if (!res.ok) {
        setEnabled(false); // silent degrade
        return;
      }
      const j = await res.json();
      if (j.conversationId) conversationId.current = j.conversationId;
      setMessages((m) => [...m, { role: "bot", text: j.answer || "(no answer)" }]);
      setCount((c) => c + 1);
    } catch {
      setEnabled(false); // silent degrade
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {open ? (
        <div className="w-[360px] max-w-[calc(100vw-40px)] bg-white border border-ink/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <header className="bg-steel text-white px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">LumiPark Assistant</div>
              <div className="text-xs opacity-75">Answers from our product data & facts</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-white/80 hover:text-white text-lg leading-none">
              ×
            </button>
          </header>
          <div className="h-72 overflow-y-auto px-4 py-3 space-y-2 text-sm">
            {messages.length === 0 && (
              <p className="text-ink-soft text-xs">
                Ask about a product's specs, certifications, or lead time. For a quote, leave an inquiry and a specialist replies within 24 hours.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block max-w-[85%] px-3 py-2 rounded-xl whitespace-pre-wrap ${
                    m.role === "user" ? "bg-steel text-white rounded-br-sm" : "bg-ink/5 text-ink rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {busy && <p className="text-ink-soft text-xs">…</p>}
            {count >= MAX_MESSAGES && (
              <p className="text-ink-soft text-xs text-center">Session limit reached — please use the contact form for more.</p>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t border-ink/10 p-3 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy || count >= MAX_MESSAGES}
              placeholder={productSlug ? "Ask about this product…" : "Ask a question…"}
              className="flex-1 border border-ink/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-steel"
            />
            <button
              type="submit"
              disabled={busy || count >= MAX_MESSAGES || !input.trim()}
              className="bg-steel text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-steel-deep disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open assistant"
          className="bg-steel text-white w-13 h-13 rounded-full shadow-lg hover:bg-steel-deep transition-colors flex items-center justify-center"
          style={{ width: 52, height: 52 }}
        >
          <span className="text-xl">💬</span>
        </button>
      )}
    </div>
  );
}
