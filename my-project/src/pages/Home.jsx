import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ImageStudio from "../components/ImageStudio";

const FREE_LIMIT = 5;

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingId, setTypingId] = useState(null);
  const [showImageStudio, setShowImageStudio] = useState(false);
  const [userPlan, setUserPlan] = useState(localStorage.getItem("user_plan") || "Free");
  const [messagesSent, setMessagesSent] = useState(parseInt(localStorage.getItem("total_messages_sent") || "0"));
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const isLimitReached = userPlan === "Free" && messagesSent >= FREE_LIMIT;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUpgrade = () => {
    localStorage.setItem("user_plan", "Pro");
    setUserPlan("Pro");
    alert("Upgraded to Pro successfully! Unlimited AI and history unlocked.");
  };

  const simulateTyping = (text, messageId) => {
    let index = 0;
    setTypingId(messageId);
    const speed = text.length > 500 ? 5 : 12;

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    typingIntervalRef.current = setInterval(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, content: text.slice(0, index + 1) } : msg
        )
      );
      index++;

      if (index >= text.length) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        setTypingId(null);
      }
    }, speed);
  };

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = localStorage.getItem("user_id");
      if (userId) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/history/${userId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.messages && data.messages.length > 0) {
              setMessages(data.messages.map((m, i) => ({ ...m, id: `hist-${i}-${Date.now()}` })));
            }
          }
        } catch (error) {
          console.error("Error fetching history:", error);
        }
      }
    };
    fetchHistory();
  }, []);



  const saveToHistory = (userPrompt) => {
    // RULE: Only save history if user is logged in (has access_token)
    if (!localStorage.getItem("access_token")) return;

    const recentActivity = JSON.parse(localStorage.getItem("recent_activity") || "[]");
    const newActivity = {
      title: userPrompt.length > 30 ? userPrompt.substring(0, 30) + "..." : userPrompt,
      time: new Date().toLocaleTimeString(),
      id: Date.now(),
    };
    const updatedActivity = [newActivity, ...recentActivity.slice(0, 19)];
    localStorage.setItem("recent_activity", JSON.stringify(updatedActivity));
    localStorage.setItem("total_conversations", updatedActivity.length.toString());
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || typingId) return;

    if (isLimitReached) return;

    const userMessage = { role: "user", content: input, id: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    // Update counts and history
    const newTotalSent = messagesSent + 1;
    setMessagesSent(newTotalSent);
    localStorage.setItem("total_messages_sent", newTotalSent.toString());
    saveToHistory(currentInput);

    try {
      // Connect to your Backend AI
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          system_prompt: "You are a helpful and powerful AI assistant.",
          user_id: localStorage.getItem("user_id") ? parseInt(localStorage.getItem("user_id")) : null
        }),
      });


      const aiId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: "assistant", content: "", id: aiId }]);
        simulateTyping(data.response || data.message || "I'm sorry, I couldn't process that.", aiId);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "Backend unavailable");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const aiId = `error-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Error: ${error.message === "Failed to fetch" ? "Connection to AI backend failed. Please try again later." : error.message}`, id: aiId },
      ]);
    } finally {
      setIsLoading(false);
    }

  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative font-sans selection:bg-indigo-100">

      {showImageStudio && <ImageStudio onClose={() => setShowImageStudio(false)} />}

      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-40 transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-[10px]">AI</span>
          </div>
          <span className="text-xs font-black tracking-widest uppercase text-gray-500">ChatGPT Pro</span>
        </div>
        <button
          onClick={() => setShowImageStudio(true)}
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-2xl text-xs font-black transition-all active:scale-95 shadow-xl"
        >
          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Create Image
        </button>
      </div>

      {/* Chat Space */}
      <div className="flex-1 w-full max-w-3xl mx-auto overflow-y-auto space-y-8 py-8 px-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full mt-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight text-center mb-10 leading-tight">
              Design & Chat<br />with Advanced AI.
            </h1>
            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={() => { setInput("How to build a SaaS?"); setTimeout(() => handleSend(), 0); }} className="px-5 py-2 rounded-2xl text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all">Build a SaaS</button>
              <button onClick={() => { setInput("Write a Python script for automation"); setTimeout(() => handleSend(), 0); }} className="px-5 py-2 rounded-2xl text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all">Python Script</button>
              <button onClick={() => setShowImageStudio(true)} className="px-5 py-2 rounded-2xl text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all">Create Image</button>
            </div>

          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
              <div
                className={`max-w-[85%] rounded-[28px] px-6 py-4 shadow-sm ${msg.role === "user" ? "bg-gray-100 text-gray-800" : "bg-white text-gray-800 border border-gray-100"
                  }`}
              >
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap text-[16px] leading-relaxed font-semibold">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-950 prose-pre:text-white prose-pre:rounded-2xl prose-strong:text-indigo-600">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                    {msg.id === typingId && <span className="inline-block w-1.5 h-5 ml-1 bg-indigo-200 animate-pulse align-middle" />}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-gray-50 rounded-2xl px-5 py-4 flex items-center space-x-1.5 border border-gray-100">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="w-full max-w-3xl mx-auto pb-12 pt-2 px-4 bg-gradient-to-t from-white via-white to-transparent sticky bottom-0">
        <form onSubmit={handleSend} className="relative group">
          <div className={`flex items-center gap-2 border rounded-[36px] px-5 py-2.5 shadow-2xl transition-all bg-white ${isLimitReached ? "border-red-50 opacity-50" : "border-gray-200 focus-within:ring-4 focus-within:ring-indigo-100/50 focus-within:border-indigo-500"
            }`}>

            {/* (+) Attachment */}
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="p-3 text-gray-400 hover:text-indigo-600 transition-colors shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" />

            <textarea
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLimitReached}
              placeholder={isLimitReached ? "Usage limit reached" : "Ask anything..."}
              className="flex-1 outline-none text-[16px] text-gray-900 placeholder-gray-400 bg-transparent resize-none py-3.5 max-h-48 disabled:cursor-not-allowed font-medium scrollbar-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || isLimitReached}
              className={`p-3 rounded-full transition-all shrink-0 shadow-lg ${input.trim() && !isLoading ? "bg-black text-white hover:bg-gray-800 rotate-0" : "bg-gray-100 text-gray-400 rotate-45 opacity-50"
                }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </form>

        <p className="text-[10px] text-gray-400 mt-6 text-center font-black uppercase tracking-[0.2em] opacity-60">
          {userPlan === "Free" ? `Free Tier (${messagesSent}/${FREE_LIMIT})` : "Premium Tier (Unlimited)"}
        </p>
      </div>

      {/* Premium Upgrade */}
      {isLimitReached && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-white/40 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white text-gray-900 rounded-[48px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.2)] p-12 max-w-md w-full border border-gray-100 text-center animate-in zoom-in duration-700">
            <div className="mx-auto w-24 h-24 bg-indigo-600 rounded-[36px] flex items-center justify-center mb-10 shadow-indigo-200 shadow-2xl transform hover:scale-105 transition-transform"><svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
            <h3 className="text-4xl font-black mb-4 tracking-tighter text-gray-900 leading-none">Limit Reached.</h3>
            <p className="text-gray-500 mb-12 leading-relaxed text-lg font-medium">Unlock unlimited conversations, history, and the full image studio.</p>
            <button onClick={handleUpgrade} className="w-full bg-black text-white font-black py-6 px-8 rounded-3xl hover:bg-gray-900 transition-all shadow-2xl active:scale-95 text-lg uppercase tracking-widest">Upgrade to Pro</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;