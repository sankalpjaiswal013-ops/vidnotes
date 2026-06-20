"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VideoResultPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("article");
  
  // Flashcard state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/process/${videoId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Failed to load video notes");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Loading your notes...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white p-4">
        <div className="bg-red-500/10 text-red-400 p-6 rounded-xl border border-red-500/20 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Oops!</h2>
          <p>{error}</p>
          <Link href="/" className="mt-4 inline-block px-4 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition">
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  const handleQuizAnswer = (optionIndex: number) => {
    if (selectedOption !== null) return; // Prevent double answering
    setSelectedOption(optionIndex);
    
    if (optionIndex === data.content.quiz[currentQuizIndex].correct_index) {
      setScore(score + 1);
    }
  };

  const nextQuizQuestion = () => {
    if (currentQuizIndex < data.content.quiz.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200">
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">V</div>
            <span className="text-xl font-bold tracking-tight text-white">VidNotes</span>
          </Link>
          
          <div className="flex bg-neutral-800 rounded-lg p-1">
            {["article", "flashcards", "quiz"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  activeTab === tab ? "bg-neutral-700 text-white shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8">
        {/* Video Header Card */}
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center md:items-start mb-8">
          <img 
            src={data.metadata.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
            alt={data.metadata.title}
            className="w-full md:w-64 aspect-video object-cover rounded-xl shadow-lg"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
              {data.metadata.title}
            </h1>
            <p className="text-neutral-400 font-medium">{data.metadata.channel}</p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-sm font-medium">
              ✓ Successfully processed
            </div>
          </div>
        </div>

        {/* --- ARTICLE TAB --- */}
        {activeTab === "article" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-none">
              {data.content.article.sections.map((section: any, i: number) => (
                <div key={i} className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-neutral-800">
                    {section.heading}
                  </h2>
                  <div className="text-neutral-300 text-lg leading-relaxed space-y-4 whitespace-pre-wrap">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Key Takeaways */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6 lg:p-8 mt-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l3 6h7l-5 5 2 7-7-4-7 4 2-7-5-5h7z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <span className="text-blue-400">★</span> Key Takeaways
              </h3>
              <ul className="space-y-3">
                {data.content.article.key_takeaways.map((point: str, i: number) => (
                  <li key={i} className="flex gap-3 text-neutral-200">
                    <span className="text-blue-500 mt-1 shrink-0">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* --- FLASHCARDS TAB --- */}
        {activeTab === "flashcards" && (
          <div className="flex flex-col items-center justify-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-sm font-medium text-neutral-400 mb-6">
              Card {currentCardIndex + 1} of {data.content.flashcards.length}
            </div>

            {/* The Card */}
            <div 
              className="w-full max-w-2xl aspect-[3/2] perspective-1000 cursor-pointer group"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`relative w-full h-full transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-neutral-800 border border-neutral-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl hover:border-neutral-500 transition-colors">
                  <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-widest text-blue-500">Front / Question</span>
                  <p className="text-2xl md:text-3xl font-medium text-white leading-tight">
                    {data.content.flashcards[currentCardIndex].front}
                  </p>
                  <span className="absolute bottom-6 text-neutral-500 text-sm">Click to flip</span>
                </div>
                
                {/* Back */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-900 to-neutral-800 border border-blue-700/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl rotate-y-180">
                  <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-widest text-emerald-400">Back / Answer</span>
                  <p className="text-xl md:text-2xl text-white leading-relaxed">
                    {data.content.flashcards[currentCardIndex].back}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-8">
              <button 
                onClick={() => {
                  setIsFlipped(false);
                  setTimeout(() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1)), 150);
                }}
                disabled={currentCardIndex === 0}
                className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button 
                onClick={() => {
                  setIsFlipped(false);
                  setTimeout(() => setCurrentCardIndex(Math.min(data.content.flashcards.length - 1, currentCardIndex + 1)), 150);
                }}
                disabled={currentCardIndex === data.content.flashcards.length - 1}
                className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* --- QUIZ TAB --- */}
        {activeTab === "quiz" && (
          <div className="max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!quizFinished ? (
              <div className="bg-neutral-800 border border-neutral-700 rounded-3xl p-6 md:p-10 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
                    Question {currentQuizIndex + 1} of {data.content.quiz.length}
                  </span>
                  <span className="text-sm font-medium text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                    Score: {score}
                  </span>
                </div>

                <h3 className="text-2xl font-semibold text-white mb-8 leading-snug">
                  {data.content.quiz[currentQuizIndex].question}
                </h3>

                <div className="space-y-3">
                  {data.content.quiz[currentQuizIndex].options.map((opt: string, i: number) => {
                    const isSelected = selectedOption === i;
                    const isCorrect = i === data.content.quiz[currentQuizIndex].correct_index;
                    const showCorrectness = selectedOption !== null;
                    
                    let btnClass = "bg-neutral-900 border-neutral-700 hover:border-neutral-500 text-neutral-200";
                    if (showCorrectness) {
                      if (isCorrect) btnClass = "bg-green-500/20 border-green-500 text-green-100";
                      else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-100";
                      else btnClass = "bg-neutral-900 border-neutral-800 text-neutral-500 opacity-50";
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleQuizAnswer(i)}
                        disabled={showCorrectness}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${btnClass}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{opt}</span>
                          {showCorrectness && isCorrect && <span className="text-green-500">✓</span>}
                          {showCorrectness && isSelected && !isCorrect && <span className="text-red-500">✗</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedOption !== null && (
                  <div className="mt-8 pt-6 border-t border-neutral-700 animate-in fade-in">
                    <p className="text-sm text-neutral-300 bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                      <strong className="text-white block mb-1">Explanation:</strong> 
                      {data.content.quiz[currentQuizIndex].explanation}
                    </p>
                    <button 
                      onClick={nextQuizQuestion}
                      className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
                    >
                      {currentQuizIndex < data.content.quiz.length - 1 ? "Next Question" : "See Final Score"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-neutral-800 border border-neutral-700 rounded-3xl p-12 text-center shadow-2xl">
                <div className="text-6xl mb-6">🏆</div>
                <h3 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h3>
                <p className="text-neutral-400 mb-8">
                  You scored {score} out of {data.content.quiz.length}.
                </p>
                <button 
                  onClick={() => {
                    setCurrentQuizIndex(0);
                    setScore(0);
                    setSelectedOption(null);
                    setQuizFinished(false);
                  }}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
                >
                  Retry Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Tailwind classes for 3D flip effect */}
      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
