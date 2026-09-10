import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  X, Send, RotateCcw, ArrowRight, Minimize2, 
  MessageSquare, ExternalLink, Bot, ShieldCheck
} from "lucide-react";
import { zakkyService } from "../../lib/zakky/zakkyService";
import { ZakkyMessage } from "../../lib/zakky/types";
import { cn } from "../../lib/utils";
import { useTheme } from "../../context/ThemeContext";

const PROMPT_SUGGESTIONS = [
  "What modules are included in Zakeem Realty ERP?",
  "How does the annual 20% discount work?",
  "What engineering services do you offer?",
  "Tell me about your Lagos and Abuja offices.",
  "Are there open engineering roles?",
];

export const ZakkyAIChatWidget: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ZakkyMessage[]>([
    zakkyService.getInitialGreeting(),
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, messages, streamingContent]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ZakkyMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      const response = await zakkyService.sendUserMessage(
        query,
        newHistory,
        (partial) => {
          setStreamingContent(partial);
        }
      );

      const assistantMessage: ZakkyMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.reply,
        timestamp: new Date(),
        actions: response.actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ZakkyMessage = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content:
          "I encountered an error processing your query. Please contact our enterprise team directly at contact@zakeemsolutions.com or try again in a moment.",
        timestamp: new Date(),
        actions: [{ label: "Contact Sales", href: "/contact" }],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingContent(null);
    }
  };

  const handleReset = () => {
    setMessages([zakkyService.getInitialGreeting()]);
    setStreamingContent(null);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40">
      {/* 1. FLOATING LAUNCHER BUTTON */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "group relative flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 backdrop-blur-xl hover:scale-[1.03] active:scale-[0.98]",
            isDark
              ? "bg-[#081c38]/90 hover:bg-[#0c2850] text-white border border-[#e57804]/40 hover:border-[#e57804] hover:shadow-[0_0_25px_rgba(229,120,4,0.35)]"
              : "bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-xl shadow-slate-200/60 hover:border-[#e57804]/60 hover:shadow-slate-300/80"
          )}
          aria-label="Open ZakkyAI Assistant"
        >
          {/* Avatar / Icon Container */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white border border-[#e57804]/40 flex items-center justify-center shrink-0 p-0.5 shadow-sm">
            <img
              src="/assets/logos/zakky-ai.png"
              alt="ZakkyAI"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to bot icon if image fails to load
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement?.querySelector(".fallback-bot")?.classList.remove("hidden");
              }}
            />
            <Bot className="fallback-bot hidden w-4 h-4 text-[#e57804]" />
            {/* Operational status indicator dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#081c38]" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-xs font-extrabold tracking-tight group-hover:text-[#e57804] transition-colors",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                ZakkyAI
              </span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#e57804]/20 text-[#e57804] border border-[#e57804]/30">
                AI
              </span>
            </div>
            <p className={cn("text-[10px] font-mono", isDark ? "text-slate-300" : "text-slate-500")}>
              Ask Zakeem Solutions
            </p>
          </div>
        </button>
      )}

      {/* 2. CHAT WINDOW DIALOG */}
      {isOpen && (
        <div
          className={cn(
            "w-[94vw] sm:w-[420px] max-w-[440px] h-[580px] max-h-[84vh]",
            "backdrop-blur-2xl border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200",
            isDark
              ? "bg-[#07172e]/95 border-white/15 text-white shadow-black/80"
              : "bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/60"
          )}
          role="dialog"
          aria-label="ZakkyAI Chat Window"
        >
          {/* Header */}
          <div
            className={cn(
              "px-5 py-4 border-b flex items-center justify-between shrink-0",
              isDark ? "border-white/10 bg-[#0a2040]/80 text-white" : "border-slate-200 bg-slate-50 text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white border border-[#e57804]/50 flex items-center justify-center shrink-0 p-0.5 shadow-sm">
                <img
                  src="/assets/logos/zakky-ai.png"
                  alt="ZakkyAI"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <Bot className="w-4 h-4 text-[#e57804]" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0a2040]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-extrabold", isDark ? "text-white" : "text-slate-900")}>ZakkyAI</span>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    Online
                  </span>
                </div>
                <p className={cn("text-[11px] font-mono", isDark ? "text-slate-300" : "text-slate-500")}>
                  Enterprise Knowledge Agent
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                title="Reset Conversation"
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                )}
                aria-label="Reset Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize Window"
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                )}
                aria-label="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                )}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={cn("flex flex-col", isUser ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed",
                      isUser
                        ? "bg-[#e57804] text-white font-medium rounded-tr-none shadow-md shadow-[#e57804]/20 btn-keep-white"
                        : isDark
                        ? "bg-[#091f3e] text-slate-200 border border-white/10 rounded-tl-none whitespace-pre-line shadow-lg"
                        : "bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-line shadow-xs"
                    )}
                  >
                    {msg.content}
                  </div>

                  {/* Actions / CTA Links */}
                  {!isUser && msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {msg.actions.map((act, i) => {
                        const isExt = act.href.startsWith("http");
                        if (isExt) {
                          return (
                            <a
                              key={i}
                              href={act.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-colors",
                                isDark
                                  ? "bg-white/5 hover:bg-white/10 border-white/15 text-white"
                                  : "bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-2xs"
                              )}
                            >
                              <span>{act.label}</span>
                              <ExternalLink className="w-3 h-3 text-[#e57804]" />
                            </a>
                          );
                        }
                        return (
                          <Link
                            key={i}
                            to={act.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-colors",
                              isDark
                                ? "bg-[#e57804]/15 hover:bg-[#e57804]/25 border-[#e57804]/40 text-[#e57804] hover:text-white"
                                : "bg-[#e57804]/10 hover:bg-[#e57804]/20 border-[#e57804]/30 text-[#e57804] hover:text-[#cf6a02]"
                            )}
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  <span className="text-[10px] font-mono text-slate-500 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}

            {/* Live Streaming Response Bubble */}
            {streamingContent !== null && (
              <div className="flex flex-col items-start">
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl rounded-tl-none px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-lg border",
                    isDark
                      ? "bg-[#091f3e] text-slate-200 border-[#e57804]/30"
                      : "bg-slate-100 text-slate-800 border-[#e57804]/40"
                  )}
                >
                  {streamingContent || (
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e57804] animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e57804] animate-pulse delay-150" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e57804] animate-pulse delay-300" />
                      <span className="ml-1 text-xs">Synthesizing verified response...</span>
                    </span>
                  )}
                  {streamingContent && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-[#e57804] animate-pulse align-middle" />
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions (shown if conversation is at starter state) */}
          {messages.length <= 2 && !streamingContent && (
            <div
              className={cn(
                "px-4 py-2 border-t overflow-x-auto no-scrollbar flex items-center gap-1.5",
                isDark ? "border-white/5 bg-[#051325]/50" : "border-slate-200 bg-slate-50"
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-mono uppercase tracking-wider shrink-0 flex items-center gap-1",
                  isDark ? "text-slate-400" : "text-slate-600"
                )}
              >
                <MessageSquare className="w-3 h-3 text-[#e57804]" /> Prompts:
              </span>
              {PROMPT_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(sug)}
                  className={cn(
                    "text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors",
                    isDark
                      ? "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/5"
                      : "bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-200 shadow-2xs"
                  )}
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div
            className={cn(
              "p-3 border-t shrink-0",
              isDark ? "border-white/10 bg-[#06172f]" : "border-slate-200 bg-slate-50"
            )}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Realty ERP, NGN pricing, careers..."
                disabled={isLoading}
                className={cn(
                  "flex-1 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm transition-colors disabled:opacity-50 focus:outline-none focus:border-[#e57804]",
                  isDark
                    ? "bg-black/40 border-white/10 text-white placeholder-slate-400"
                    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                )}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-[#e57804] hover:bg-[#ff890a] disabled:opacity-40 disabled:hover:bg-[#e57804] text-white transition-colors shrink-0 shadow-lg shadow-[#e57804]/20 btn-keep-white"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div
              className={cn(
                "flex items-center justify-between text-[10px] font-mono mt-2 px-1",
                isDark ? "text-slate-400" : "text-slate-500"
              )}
            >
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Grounded in Zakeem Enterprise Data</span>
              </span>
              <span>All prices in NGN (₦)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
