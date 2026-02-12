import React, { useState } from "react";

const ImageStudio = ({ onClose }) => {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);

        // Simulating AI Image Generation (DALL-E style)
        // In a real app, this would fetch from an API like OpenAI or Midjourney
        setTimeout(() => {
            setGeneratedImage(`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(prompt)}`);
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-[#1a1a1a] w-full max-w-4xl rounded-[40px] border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[80vh]">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white">AI Image Studio</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">DALL·E Powered Generation</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-2xl transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center space-y-10">
                    {!generatedImage && !isGenerating ? (
                        <div className="text-center space-y-4 opacity-40">
                            <div className="mx-auto w-20 h-20 bg-white/5 rounded-[30px] flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <p className="text-lg font-medium text-white italic">"A futuristic cityscape in cyberpunk style..."</p>
                        </div>
                    ) : isGenerating ? (
                        <div className="text-center space-y-6">
                            <div className="w-64 h-64 bg-white/5 rounded-3xl animate-pulse flex items-center justify-center border border-white/10">
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-indigo-400 font-bold tracking-widest uppercase text-[10px] animate-pulse">Generating your masterpiece...</p>
                        </div>
                    ) : (
                        <div className="relative group">
                            <img
                                src={generatedImage}
                                alt="Generated"
                                className="w-80 h-80 object-cover rounded-[32px] shadow-2xl border border-white/20 animate-in zoom-in duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px] flex items-center justify-center gap-4">
                                <button
                                    onClick={async () => {
                                        try {
                                            const response = await fetch(generatedImage);
                                            const blob = await response.blob();
                                            const url = window.URL.createObjectURL(blob);
                                            const link = document.createElement("a");
                                            link.href = url;
                                            link.download = `ai-image-${Date.now()}.svg`;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            window.URL.revokeObjectURL(url);
                                        } catch (error) {
                                            console.error("Download failed:", error);
                                            alert("Download failed. Please try again.");
                                        }
                                    }}
                                    className="bg-white text-black p-4 rounded-2xl shadow-xl hover:scale-110 transition-transform"
                                    title="Download Image"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </button>
                            </div>
                        </div>

                    )}
                </div>

                {/* Footer Input */}
                <div className="p-8 border-t border-white/5 bg-black/20">
                    <div className="max-w-2xl mx-auto flex gap-4">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                            placeholder="Describe the image you want to create..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:border-indigo-500/50 outline-none transition-all"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95"
                        >
                            Generate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageStudio;
