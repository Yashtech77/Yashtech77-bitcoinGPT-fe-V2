
import { useEffect, useState, useRef } from "react";
import { 
  Home, 
  Compass, 
  History as HistoryIcon, 
  Trash2, 
  Pencil, 
  Check, 
  X,
  Search,
  ChevronDown,
  ChevronRight,
  Settings,
  User,
  LogOut,
  MessageSquare
} from "lucide-react";
import { useSession } from "../context/SessionContext";
import { useChat } from "../context/ChatContext";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Portal({ children }) {
  return createPortal(children, document.body);
}

const SideNav = ({
  openToggle,
  setOpenToggle,
  hasUsedSession,
  setHasUsedSession,
}) => {
  const {
    sessions,
    setSessions,
    currentSessionId,
    setCurrentSessionId,
    fetchSessions,
    createNewSession,
    deleteSession,
    renameSession,
  } = useSession();

  const [loading, setLoading] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const [isHomeExpanded, setIsHomeExpanded] = useState(false);
  const [isDiscoverExpanded, setIsDiscoverExpanded] = useState(false);
  const [userName, setUserName] = useState("User");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const { messages } = useChat();
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const settingsRef = useRef(null);
  const feedbackRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.name) setUserName(parsed.name);
      } catch (err) {
        console.error("Error parsing user object", err);
      }
    }
  }, []);

  useEffect(() => {
    let lenisInstance = null;
    let rafId = null;

    const initLenis = async () => {
      if (!scrollRef.current || !contentRef.current) return;

      try {
        const mod = await import("lenis").catch(() => import("@studio-freight/lenis"));
        const Lenis = mod?.default || mod;

        lenisInstance = new Lenis({
          wrapper: scrollRef.current,
          content: contentRef.current,
          duration: 1.2,
          smooth: true,
          smoothTouch: false,
        });

        const loop = (time) => {
          if (lenisInstance && typeof lenisInstance.raf === "function") {
            lenisInstance.raf(time);
          }
          rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);
      } catch (err) {
        console.warn("Lenis init failed (optional):", err);
      }
    };

    initLenis();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenisInstance && typeof lenisInstance.destroy === "function") {
        lenisInstance.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
      if (feedbackRef.current && !feedbackRef.current.contains(event.target)) {
        setIsFeedbackOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNewChat = async () => {
    if (!hasUsedSession && currentSessionId) {
      toast.warn("You haven't used the current chat yet.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/sessions/${currentSessionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.warn("Optional session delete failed:", err);
    }

    await createNewSession();
    setHasUsedSession(false);
    setLoading(false);
  };

  const handleDeleteSession = async (session_id) => {
    setLoading(true);
    await deleteSession(session_id);
    setLoading(false);
  };

  const handleRenameSession = async (session_id) => {
    if (!renameValue.trim()) return;
    setLoading(true);
    await renameSession(session_id, renameValue);
    setRenamingId(null);
    setRenameValue("");
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const handleFeedbackSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      let userId = sessionStorage.getItem("userId");
      let sessionId = sessionStorage.getItem("sessionId");

      if (!userId) {
        const user = localStorage.getItem("user");
        if (user) {
          try {
            const parsed = JSON.parse(user);
            userId = parsed.id || 0;
          } catch (err) {
            console.error("Error parsing user object", err);
          }
        }
      }

      const payload = {
        userId: userId ? parseInt(userId) : 0,
        session_id: sessionId || "00000000-0000-0000-0000-000000000000",
        feedback: feedback,
      };

      const res = await fetch(`${BASE_URL}/api/user/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Feedback submitted successfully");
        setFeedback("");
        setIsFeedbackOpen(false);
      } else {
        toast.error(data.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error submitting feedback");
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredSessions = sessions.filter((session) =>
    session.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!openToggle) {
    return (
      <div className="w-16 h-full bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-4">
        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer" onClick={() => setOpenToggle(true)}>
          <span className="text-white font-bold text-xl">₿</span>
        </div>
        <button
          onClick={() => setOpenToggle(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Home"
        >
          <Home size={20} className="text-gray-600" />
        </button>
        <button
          onClick={() => setOpenToggle(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Discover"
        >
          <Compass size={20} className="text-gray-600" />
        </button>
        <button
          onClick={() => setOpenToggle(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="History"
        >
          <HistoryIcon size={20} className="text-gray-600" />
        </button>
        <div className="flex-1"></div>
        <button 
          onClick={() => setOpenToggle(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition" 
          title="Settings"
        >
          <Settings size={20} className="text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="Profile">
          <User size={20} className="text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">₿</span>
            </div>
            <h1 className="text-gray-800 text-lg font-semibold">Bitcoin GPT</h1>
          </div>
          <button
            onClick={() => setOpenToggle(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div ref={contentRef} className="p-2">
          {/* Home */}
          <div className="mb-1">
            <button
              onClick={() => setIsHomeExpanded(!isHomeExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition text-gray-700"
            >
              <div className="flex items-center gap-3">
                <Home size={18} />
                <span className="text-sm font-medium">Home</span>
              </div>
              {isHomeExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          {/* Discover */}
          <div className="mb-1">
            <button
              onClick={() => setIsDiscoverExpanded(!isDiscoverExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition text-gray-700"
            >
              <div className="flex items-center gap-3">
                <Compass size={18} />
                <span className="text-sm font-medium">Discover</span>
              </div>
              {isDiscoverExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          {/* History */}
          <div className="mb-1">
            <button
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition text-gray-700"
            >
              <div className="flex items-center gap-3">
                <HistoryIcon size={18} />
                <span className="text-sm font-medium">History</span>
              </div>
              {isHistoryExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {isHistoryExpanded && (
              <div className="mt-2 space-y-1 pl-2">
                {loading ? (
                  <span className="text-gray-500 text-sm px-3">Loading...</span>
                ) : filteredSessions.length === 0 ? (
                  <span className="text-gray-500 text-sm px-3">No sessions found</span>
                ) : (
                  filteredSessions.map((session, idx) => (
                    <div
                      key={session.session_id || idx}
                      className={`relative group rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer ${
                        currentSessionId === session.session_id
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setCurrentSessionId(session.session_id);
                        if (window.innerWidth < 768) {
                          setOpenToggle(false);
                        }
                      }}
                    >
                      {renamingId === session.session_id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            className="text-sm border border-indigo-300 focus:outline-none focus:border-indigo-500 rounded px-2 py-1 bg-white w-full"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRenameSession(session.session_id);
                              if (e.key === "Escape") {
                                setRenamingId(null);
                                setRenameValue("");
                              }
                            }}
                            autoFocus
                            disabled={loading}
                          />
                          <button onClick={() => handleRenameSession(session.session_id)}>
                            <Check size={16} className="text-green-600" />
                          </button>
                          <button
                            onClick={() => {
                              setRenamingId(null);
                              setRenameValue("");
                            }}
                          >
                            <X size={16} className="text-red-600" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center w-full">
                          <span className="text-sm truncate max-w-[150px]">
                            {session.title?.trim() || "New Chat"}
                          </span>

                          <div
                            className="relative ml-2 group-hover:opacity-100 opacity-0 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setDropdownPosition({
                                left: rect.right - 128,
                                top: rect.bottom + 8,
                              });
                              setOpenDropdownId((prev) =>
                                prev === session.session_id ? null : session.session_id
                              );
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 cursor-pointer"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <circle cx="5" cy="12" r="1.5" />
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="19" cy="12" r="1.5" />
                            </svg>

                            {openDropdownId === session.session_id && (
                              <Portal>
                                <div
                                  style={{
                                    position: "fixed",
                                    left: dropdownPosition.left,
                                    top: dropdownPosition.top,
                                    width: "8rem",
                                    zIndex: 9999,
                                  }}
                                  className="bg-white text-black rounded-lg shadow-lg border border-gray-200"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm rounded-t-lg"
                                    onClick={() => {
                                      setRenamingId(session.session_id);
                                      setRenameValue(session.title || "");
                                      setOpenDropdownId(null);
                                    }}
                                  >
                                    <Pencil size={14} /> Rename
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 flex items-center gap-2 text-sm rounded-b-lg"
                                    onClick={() => {
                                      handleDeleteSession(session.session_id);
                                      setOpenDropdownId(null);
                                    }}
                                  >
                                    <Trash2 size={14} /> Delete
                                  </button>
                                </div>
                              </Portal>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 p-4">
        {/* New Chat Button */}
        <button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-sm font-medium mb-3 transition"
          onClick={handleNewChat}
          disabled={loading}
        >
          + New Chat
        </button>

        {/* User Profile */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{userName}</p>
              <p className="text-xs text-gray-500">Basic Member</p>
            </div>
          </div>
          <div className="relative" ref={settingsRef}>
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Settings size={18} className="text-gray-600" />
            </button>

            {isSettingsOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button
                  onClick={() => {
                    setIsFeedbackOpen(true);
                    setIsSettingsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm rounded-t-lg"
                >
                  <MessageSquare size={14} />
                  Feedback
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm rounded-b-lg"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Popup Modal */}
      {isFeedbackOpen && (
        <Portal>
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50 z-50">
            <div
              ref={feedbackRef}
              className="bg-white p-6 rounded-lg shadow-lg w-80"
            >
              <h2 className="text-lg font-bold mb-4">Submit Feedback</h2>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full border rounded p-2 mb-4"
                placeholder="Write your feedback..."
                rows="4"
              ></textarea>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsFeedbackOpen(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default SideNav;
