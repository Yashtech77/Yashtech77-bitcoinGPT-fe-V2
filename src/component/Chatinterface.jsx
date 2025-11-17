 


import { useState, useEffect, useRef } from "react";
import SideNav from "./SideNav";
import { useChat } from "../context/ChatContext";
import { useSession } from "../context/SessionContext";
import RightNav from "./RightNav";
import { 
  Menu, 
  PanelRight, 
  Send, 
  Mic, 
  Paperclip, 
  HelpCircle,
  ExternalLink
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { motion, AnimatePresence } from "framer-motion";

export default function Chatinterface() {
  const [input, setInput] = useState("");
  const {
    messages,
    sendMessage,
    loading,
    sessionLoading,
  } = useChat();

  const { currentSessionId, setCurrentSessionId } = useSession();
  const [hasUsedSession, setHasUsedSession] = useState(false);

  const [showSideNav, setShowSideNav] = useState(false);
  const [showRightNav, setShowRightNav] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Suggestion chips
  const suggestions = [
    "Myth Busting",
    "Practical Learning",
    "Explain Like I'm 5",
    "Bitcoin Corporate Strategy",
    "Adoption in APAC"
  ];

  const createNewSession = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/sessions/new`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();

      setCurrentSessionId(data.session_id || data.id);
    } catch (err) {
      console.error("Error creating session:", err);
    }
  };

  const hasCreatedRef = useRef(false);

  useEffect(() => {
    if (!currentSessionId && !hasCreatedRef.current) {
      hasCreatedRef.current = true;
      createNewSession();
    }
  }, []);

  useEffect(() => {
    if (currentSessionId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentSessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const message = input;
    setInput("");

    await sendMessage(message);
    inputRef.current?.focus();
    setHasUsedSession(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleSessionSelect = (sessionId) => {
    setCurrentSessionId(sessionId);
    setShowSideNav(false);
  };

  const isInputDisabled = loading || sessionLoading || !currentSessionId;

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="w-full h-[89vh] bg-gray-50 flex flex-col">
      {/* Mobile Nav Toggles */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white border-b">
        <button onClick={() => setShowSideNav(true)}>
          <Menu className="text-gray-700" />
        </button>
        <button onClick={() => setShowRightNav(true)}>
          <PanelRight className="text-gray-700" />
        </button>
      </div>

      <div className="flex h-full overflow-hidden">
        {/* Desktop SideNav */}
        <div className="hidden md:block w-[280px] h-full">
          <SideNav
            openToggle={true}
            setOpenToggle={setShowSideNav}
            onSessionSelect={handleSessionSelect}
            hasUsedSession={hasUsedSession}
            setHasUsedSession={setHasUsedSession}
          />
        </div>

        {/* Mobile SideNav */}
        <AnimatePresence>
          {showSideNav && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex md:hidden"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.3 }}
                className="bg-white w-[280px] h-full overflow-y-auto"
              >
                <SideNav
                  openToggle={true}
                  setOpenToggle={setShowSideNav}
                  onSessionSelect={handleSessionSelect}
                  hasUsedSession={hasUsedSession}
                  setHasUsedSession={setHasUsedSession}
                />
              </motion.div>
              <div
                className="flex-1"
                onClick={() => setShowSideNav(false)}
              ></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Section */}
        <div className="flex flex-col flex-1 h-full overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {messages.length === 0 && !loading ? (
              <div className="flex flex-col justify-center items-center h-full px-4">
                <div className="max-w-3xl w-full text-center space-y-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Your AI Partner for Bitcoin Intelligence
                  </h1>
                  <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                    Powered by Jetking’s vision for a financially sovereign future.
Get instant, reliable answers about Bitcoin, blockchain, and the new digital economy.
                  </p>

                  {/* Search Input */}
                  <div className="max-w-2xl mx-auto mt-8">
                    <form className="relative" onSubmit={handleSend}>
                      <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <HelpCircle size={20} className="text-gray-400" />
                        <input
                          ref={inputRef}
                          type="text"
                          placeholder="Ask anything about Bitcoin, security, or adoption"
                          className="flex-1 focus:outline-none text-gray-700 text-sm"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          disabled={isInputDisabled}
                        />
                        <button
                          type="button"
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          disabled={isInputDisabled}
                        >
                          <Mic size={20} className="text-gray-500" />
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          disabled={isInputDisabled}
                        >
                          <Paperclip size={20} className="text-gray-500" />
                        </button>
                        <button
                          type="submit"
                          className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isInputDisabled || !input.trim()}
                        >
                          <Send size={20} className="text-white" />
                        </button>
                      </div>
                    </form>

                    {/* Suggestion Chips */}
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition"
                          disabled={isInputDisabled}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto px-4 py-6">
                <AnimatePresence>
                  {messages.map((msg, idx) => {
                    const isAssistant = msg.role === "assistant";
                    const cleanContent = msg.content
                      ?.replace(/^\s*[-*+]\s*$/gm, "")
                      .replace(/\n{3,}/g, "\n\n")
                      .trim();

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={`mb-6 ${
                          msg.role === "user" ? "flex justify-end" : "flex justify-start"
                        }`}
                      >
                        <div
                          className={`${
                            isAssistant
                              ? "bg-gray-50 text-gray-900 max-w-full"
                              : "bg-indigo-600 text-white max-w-[80%]"
                          } rounded-2xl px-5 py-3 shadow-sm`}
                        >
                          {isAssistant && msg.timestamp && (
                            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                              <span>{formatTimestamp(msg.timestamp)}</span>
                            </div>
                          )}
                          
                          <ReactMarkdown
                            children={cleanContent}
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                              h1: ({ node, ...props }) => (
                                <h1 className="text-xl font-bold mt-4 mb-2" {...props} />
                              ),
                              h2: ({ node, ...props }) => (
                                <h2 className="text-lg font-semibold mt-4 mb-2" {...props} />
                              ),
                              h3: ({ node, ...props }) => (
                                <h3 className="text-md font-semibold mt-3 mb-1" {...props} />
                              ),
                              p: ({ node, ...props }) => (
                                <p className="mb-2 leading-relaxed" {...props} />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul className="list-disc pl-6 mb-2 space-y-1" {...props} />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol className="list-decimal pl-6 mb-2 space-y-1" {...props} />
                              ),
                              li: ({ node, ...props }) => (
                                <li className="leading-relaxed text-sm md:text-base" {...props} />
                              ),
                              code({ inline, className, children, ...props }) {
                                return !inline ? (
                                  <pre className="bg-gray-900 text-white p-3 rounded-lg overflow-x-auto text-sm my-2">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                ) : (
                                  <code className={`${isAssistant ? 'bg-gray-200' : 'bg-indigo-500/30'} text-sm rounded px-1 py-0.5`}>
                                    {children}
                                  </code>
                                );
                              },
                              blockquote: ({ node, ...props }) => (
                                <blockquote
                                  className="border-l-4 border-indigo-400 pl-4 italic my-3"
                                  {...props}
                                />
                              ),
                              a: ({ node, ...props }) => (
                                <a
                                  {...props}
                                  className={`${isAssistant ? 'text-indigo-600' : 'text-indigo-200'} underline hover:no-underline break-words`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              ),
                            }}
                          />

                          {/* External Link Card (if exists in message) */}
                          {msg.externalLink && (
                            <div className="mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 text-white">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-sm">
                                  {msg.externalLink.title}
                                </h4>
                                <ExternalLink size={16} />
                              </div>
                              <p className="text-xs opacity-90 mb-2">
                                {msg.externalLink.description}
                              </p>
                              <a
                                href={msg.externalLink.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs underline opacity-90 hover:opacity-100 break-all"
                              >
                                {msg.externalLink.url}
                              </a>
                              <div className="text-xs mt-2 opacity-75">
                                {formatTimestamp(msg.timestamp)}
                              </div>
                            </div>
                          )}

                          {/* Sources (if exists) */}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <ExternalLink size={16} />
                                Sources
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {msg.sources.map((source, sIdx) => (
                                  <a
                                    key={sIdx}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition group"
                                  >
                                    <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-700">
                                      {source.title}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs text-gray-500 truncate">
                                        {source.domain}
                                      </p>
                                      <ExternalLink size={12} className="text-gray-400 group-hover:text-indigo-600 flex-shrink-0" />
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {loading && (
                  <div className="flex items-center gap-2 mb-6">
                    <div className="bg-gray-50 rounded-2xl px-5 py-3">
                      <div className="flex items-center gap-2 animate-pulse">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <span className="ml-2 text-sm text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef}></div>
              </div>
            )}
          </div>

          {/* Bottom Input (when chat has started) */}
          {messages.length > 0 && (
            <div className="border-t border-gray-200 bg-white px-4 py-4">
              <div className="max-w-4xl mx-auto">
                <form className="relative" onSubmit={handleSend}>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <HelpCircle size={20} className="text-gray-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Ask anything about Bitcoin, security, or adoption"
                      className="flex-1 focus:outline-none text-gray-700 text-sm"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={isInputDisabled}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (!isInputDisabled) handleSend(e);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      disabled={isInputDisabled}
                    >
                      <Mic size={20} className="text-gray-500" />
                    </button>
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      disabled={isInputDisabled}
                    >
                      <Paperclip size={20} className="text-gray-500" />
                    </button>
                    <button
                      type="submit"
                      className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isInputDisabled || !input.trim()}
                    >
                      <Send size={20} className="text-white" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Desktop RightNav */}
        <div className="hidden md:block w-[320px] h-full border-l border-gray-200 bg-white">
          <RightNav />
        </div>

        {/* Mobile RightNav */}
        <AnimatePresence>
          {showRightNav && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end md:hidden"
            >
              <div
                className="flex-1"
                onClick={() => setShowRightNav(false)}
              ></div>
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.3 }}
                className="bg-white w-[320px] h-full overflow-y-auto"
              >
                <RightNav />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}