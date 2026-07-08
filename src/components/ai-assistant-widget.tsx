import { useRef, useState, useEffect } from "react";
import { useAuthSession, useRoles } from "@/hooks/use-auth";
import { aiChat } from "@/lib/ai-chat.server";
import { Sparkles, X, Send, Paperclip, Loader2, Bot, User as UserIcon, ChevronDown, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

type ChatMsg = { role: "user" | "assistant"; text: string; image?: string; ts: string };

const QUICK_COMMANDS = [
  { icon: "👥", label: "Ardayda guud", cmd: "Tus guudmar ardayda oo dhan" },
  { icon: "💰", label: "Income bishaan", cmd: "Maxay tahay income-ka iyo kharashka bishaan?" },
  { icon: "📅", label: "Imaanshaha maanta", cmd: "Tus imaanshaha ardayda maanta" },
  { icon: "⚠️", label: "Dacwooyin", cmd: "Tus dacwooyinkii ugu dambeeyay" },
  { icon: "📝", label: "Imtixaanada", cmd: "Tus natiijooyinkii imtixaanada ugu dambeeyay" },
  { icon: "📊", label: "Dashboard", cmd: "Ii sii guudmar dugsiga maanta" },
];

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString("so-SO", { hour: "2-digit", minute: "2-digit" });
}

export function AiAssistantWidget() {
  const { user } = useAuthSession();
  const { primary } = useRoles(user?.id);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<{ base64: string; mediaType: string; preview: string } | null>(null);
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowed = primary === "maamule" || primary === "maaliyadda";
  if (!allowed) return null;

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [history, open, minimized]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Kaliya sawirro la oggol yahay");
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPendingImage({ base64: result.split(",")[1], mediaType: file.type, preview: result });
    };
    reader.readAsDataURL(file);
  };

  const send = async (overrideText?: string) => {
    const text = overrideText || input;
    if (!text.trim() && !pendingImage) return;

    const userMsg: ChatMsg = { role: "user", text, image: pendingImage?.preview, ts: new Date().toISOString() };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInput("");
    setPendingImage(null);
    setBusy(true);

    const contentBlocks: any[] = [];
    if (pendingImage) contentBlocks.push({ type: "image", source: { type: "base64", media_type: pendingImage.mediaType, data: pendingImage.base64 } });
    contentBlocks.push({ type: "text", text: text || "Fiiri sawirkaan" });

    const apiMessages = newHistory.map((h) => ({
      role: h.role,
      content: h === userMsg ? contentBlocks : h.text,
    }));

    try {
      const res = await aiChat({ data: { messages: apiMessages as any } });
      setHistory((h) => [...h, { role: "assistant", text: (res as any).reply, ts: new Date().toISOString() }]);
    } catch (err: any) {
      const errMsg = err.message?.includes("ANTHROPIC_API_KEY")
        ? "AI-ga ma shaqaynayo — ANTHROPIC_API_KEY lama dejin. Ku dar Vercel environment variables."
        : err.message || "Khalad ayaa dhacay";
      toast.error(errMsg);
      setHistory((h) => [...h, { role: "assistant", text: `❌ ${errMsg}`, ts: new Date().toISOString() }]);
    } finally {
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const clearHistory = () => { setHistory([]); toast.success("Wada-hadalka waa la nadiifiyay"); };

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimized(false); }}
          className="fixed bottom-6 right-6 z-40 group"
          title="AI Agent-ka Dugsiga"
        >
          <div className="size-14 rounded-full bg-gradient-to-br from-primary to-brand-green text-white shadow-xl grid place-items-center hover:scale-110 active:scale-95 transition-all duration-200">
            <Sparkles className="size-6 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="absolute -top-1 -right-1 size-4 bg-brand-green rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className={`fixed z-50 right-6 bottom-6 w-[400px] max-w-[95vw] bg-card border border-border rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${minimized ? "h-[60px]" : "h-[600px] max-h-[85vh]"}`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-brand-green text-white px-4 py-3 flex items-center justify-between rounded-t-2xl shrink-0 cursor-pointer" onClick={() => setMinimized(m => !m)}>
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-full bg-white/20 backdrop-blur grid place-items-center">
                <Bot className="size-5" />
              </div>
              <div>
                <div className="font-bold text-sm flex items-center gap-1.5">
                  AI Super-Agent
                  <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full">ONLINE</span>
                </div>
                <div className="text-[10px] opacity-80">New Generation School · {primary === "maamule" ? "Full Access" : "Finance Access"}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {history.length > 0 && !minimized && (
                <button onClick={(e) => { e.stopPropagation(); clearHistory(); }} className="p-1.5 hover:bg-white/15 rounded" title="Nadiifi"><Trash2 className="size-3.5" /></button>
              )}
              <button onClick={(e) => { e.stopPropagation(); setMinimized(m => !m); }} className="p-1.5 hover:bg-white/15 rounded">
                <ChevronDown className={`size-4 transition-transform ${minimized ? "rotate-180" : ""}`} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setOpen(false); }} className="p-1.5 hover:bg-white/15 rounded">
                <X className="size-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Message area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/20">
                {/* Welcome / Quick commands */}
                {history.length === 0 && (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="size-14 rounded-2xl bg-gradient-to-br from-primary to-brand-green text-white grid place-items-center mx-auto mb-3">
                        <Zap className="size-7" />
                      </div>
                      <div className="font-bold text-primary">AI Super-Agent</div>
                      <div className="text-xs text-muted-foreground mt-1">Waxaan awoodaa inaan xog kasta ku daro, tafatiro, ama tirto — kaliya ii sheeg</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_COMMANDS.map((qc) => (
                        <button key={qc.label} onClick={() => send(qc.cmd)} className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border hover:border-primary hover:bg-primary/5 text-left transition text-xs">
                          <span className="text-lg">{qc.icon}</span>
                          <span className="font-medium text-primary">{qc.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                {history.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    {m.role === "assistant" && (
                      <div className="size-7 rounded-full bg-gradient-to-br from-primary to-brand-green text-white grid place-items-center shrink-0 mt-1">
                        <Bot className="size-3.5" />
                      </div>
                    )}
                    <div className={`max-w-[82%] space-y-1 ${m.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                      <div className={`rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm text-foreground"}`}>
                        {m.image && <img src={m.image} className="rounded-lg mb-2 max-h-40 object-cover w-full" />}
                        {m.text}
                      </div>
                      <div className="text-[10px] text-muted-foreground px-1">{formatTime(m.ts)}</div>
                    </div>
                    {m.role === "user" && (
                      <div className="size-7 rounded-full bg-secondary grid place-items-center shrink-0 mt-1">
                        <UserIcon className="size-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {busy && (
                  <div className="flex gap-2">
                    <div className="size-7 rounded-full bg-gradient-to-br from-primary to-brand-green text-white grid place-items-center shrink-0">
                      <Bot className="size-3.5" />
                    </div>
                    <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                      <div className="flex gap-1">
                        {[0,1,2].map(i => (
                          <div key={i} className="size-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Pending image preview */}
              {pendingImage && (
                <div className="px-3 pt-2 flex items-center gap-2 border-t border-border">
                  <img src={pendingImage.preview} className="size-12 rounded-lg object-cover border border-border" />
                  <div className="text-xs text-muted-foreground flex-1">Sawir la doortay</div>
                  <button onClick={() => setPendingImage(null)} className="text-xs text-rose-600 hover:underline">Ka saar</button>
                </div>
              )}

              {/* Input area */}
              <div className="p-3 border-t border-border flex items-end gap-2 shrink-0">
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onPickFile} />
                <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground shrink-0 mb-0.5" title="Sawir ku dar">
                  <Paperclip className="size-4" />
                </button>
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder="Wax ku qor ama ammar sii..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30 pr-10"
                    disabled={busy}
                  />
                </div>
                <button
                  onClick={() => send()}
                  disabled={busy || (!input.trim() && !pendingImage)}
                  className="size-10 rounded-xl bg-brand-green text-white grid place-items-center shrink-0 disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
