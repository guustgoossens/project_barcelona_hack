import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { useUIMessages, SmoothText } from "@convex-dev/agent/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Send, X, Bot, User } from "lucide-react";

type Props = {
  campaignId: Id<"campaigns">;
  threadId: string | null;
  onClose: () => void;
  // Context for auto-prompting via "Optimize"
  autoPrompt?: string | null;
  onAutoPromptConsumed?: () => void;
};

export default function ChatPanel({
  campaignId,
  threadId,
  onClose,
  autoPrompt,
  onAutoPromptConsumed,
}: Props) {
  const [input, setInput] = useState("");
  const sendMessage = useMutation(api.chat.sendMessage);
  const ensureThread = useMutation(api.chat.ensureThread);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [localThreadId, setLocalThreadId] = useState(threadId);

  // Ensure thread exists
  useEffect(() => {
    if (!localThreadId) {
      ensureThread({ campaignId }).then((tid) => setLocalThreadId(tid));
    }
  }, [campaignId, localThreadId, ensureThread]);

  // Fetch messages via the agent's streaming query
  const messagesResult = useUIMessages(
    api.chat.listMessages,
    localThreadId ? { threadId: localThreadId } : "skip",
    { initialNumItems: 50, stream: true },
  );

  const messages = messagesResult?.results ?? [];

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, messages[messages.length - 1]?.text]);

  // Handle auto-prompt from "Optimize" button
  useEffect(() => {
    if (autoPrompt && localThreadId) {
      sendMessage({ threadId: localThreadId, prompt: autoPrompt });
      onAutoPromptConsumed?.();
    }
  }, [autoPrompt, localThreadId, sendMessage, onAutoPromptConsumed]);

  async function handleSend() {
    if (!input.trim() || !localThreadId) return;
    const prompt = input.trim();
    setInput("");
    await sendMessage({ threadId: localThreadId, prompt });
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-semibold text-gray-900">
            NeuralReach Optimizer
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              Click <strong>Optimize</strong> on a variant with a lead selected,
              or ask a question about your campaign.
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          // Skip non-user/assistant messages
          if (msg.role !== "user" && msg.role !== "assistant") return null;
          return (
            <div
              key={msg.key}
              className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-indigo-600" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  isUser
                    ? "bg-gray-900 text-white"
                    : "bg-gray-50 text-gray-700 border border-gray-100"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <SmoothText text={msg.text ?? ""} />
                )}
              </div>
              {isUser && (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-gray-600" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-3 py-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask the optimizer..."
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
