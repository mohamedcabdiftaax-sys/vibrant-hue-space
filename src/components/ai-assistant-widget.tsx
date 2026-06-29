import { useRef, useState } from "react";
import { useAuthSession, useRoles } from "@/hooks/use-auth";
import { aiChat } from "@/lib/ai-chat.server";
import { Sparkles, X, Send, Paperclip, Loader2, Bot, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

type ChatMsg = { role: "user" | "assistant"; text: string; image?: string };

export function AiAssistantWidget() {
  const { user } = useAuthSession();
  const { primary } = useRoles(user?.id);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<{ base64: string; mediaType: string; preview: string } | null>(null);
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowed = primary === "maamule" || primary === "maaliyadda";
  if (!allowed) return null;

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Kaliya sawirro la oggol yahay hadda");
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      setPendingImage({ base64, mediaType: file.type, preview: result });
    };
    reader.readAsDataURL(file);
  };

  const send = async () => {
    if (!input.trim() && !pendingImage) return;
    const userMsg: ChatMsg = { role: "user", text: input, image: pendingImage?.preview };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);

    const contentBlocks: any[] = [];
    if (pendingImage) contentBlocks.push({ type: "image", source: { type: "base64", media_type: pendingImage.mediaType, data: pendingImage.base64 } });
    contentBlocks.push({ type: "text", text: input || "Fadlan eeg sawirkan." });

    const apiMessages = [
      ...history.map((h) => ({ role: h.role, content: h.text })),
      { role: "user" as const, content: contentBlocks },
    ];

    setInput("");
    setPendingImage(null);
    setBusy(true);
    try {
      const res = await aiChat({ data: { messages: apiMessages as any } });
      setHistory((h) => [...h, { role: "assistant", text: (res as any).reply }]);
    } catch (err: any) {
      toast.error(err.message || "Khalad ayaa dhacay");
      setHistory((h) => [...h, { role: "assistant", text: "Waan ka xumahay, khalad ayaa dhacay. Isku day mar kale." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 size-14 rounded-full bg-gradient-to-br from-primary to-brand-green text-white shadow-lg grid place-items-center hover:scale-105 active:scale-95 transition-transform animate-[pulse_3s_ease-in-out_infinite]"
        >
          <Sparkles className="size-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[92vw] h-[560px] max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-gradient-to-r from-primary to-brand-green text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-white/20 grid place-items-center"><Bot className="size-4.5" /></div>
              <div>
                <div className="font-semibold text-sm">AI Agent-ka Dugsiga</div>
                <div className="text-[10px] opacity-80">Maamule & Maaliyadda</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/15 rounded"><X className="size-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/30">
            {history.length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-8 space-y-2">
                <Sparkles className="size-6 mx-auto text-primary/40" />
                <div>Weydii wax ku saabsan ardayda, shaqaalaha, ama lacagta.</div>
                <div className="text-[10px] opacity-70">Tusaale: "Raadi Amina Xasan" ama "Diiwaangeli arday cusub"</div>
              </div>
            )}
            {history.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && <div className="size-7 rounded-full bg-primary/15 text-primary grid place-items-center shrink-0"><Bot className="size-3.5" /></div>}
                <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}>
                  {m.image && <img src={m.image} className="rounded-lg mb-1.5 max-h-40 object-cover" />}
                  {m.text}
                </div>
                {m.role === "user" && <div className="size-7 rounded-full bg-secondary grid place-items-center shrink-0"><UserIcon className="size-3.5" /></div>}
              </div>
            ))}
            {busy && (
              <div className="flex gap-2">
                <div className="size-7 rounded-full bg-primary/15 text-primary grid place-items-center shrink-0"><Bot className="size-3.5" /></div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3 py-2 text-sm flex items-center gap-1.5 text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" /> Wuu fikirayaa...
                </div>
              </div>
            )}
          </div>

          {pendingImage && (
            <div className="px-3 pt-2 flex items-center gap-2">
              <img src={pendingImage.preview} className="size-12 rounded-lg object-cover border border-border" />
              <button onClick={() => setPendingImage(null)} className="text-xs text-rose-600">Ka saar</button>
            </div>
          )}

          <div className="p-3 border-t border-border flex items-center gap-2 shrink-0">
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onPickFile} />
            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground shrink-0"><Paperclip className="size-4" /></button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Qor su'aal..."
              className="flex-1 px-3 py-2 rounded-lg bg-secondary text-sm outline-none"
            />
            <button onClick={send} disabled={busy} className="p-2 rounded-lg bg-brand-green text-white shrink-0 disabled:opacity-50"><Send className="size-4" /></button>
          </div>
        </div>
      )}
    </>
  );
}
