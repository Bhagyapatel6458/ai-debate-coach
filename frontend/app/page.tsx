'use client'
import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [argument, setArgument] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");
  const [gameStarted, setGameStarted] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  const topics = [
    "Social Media does more harm than good",
    "AI will replace human jobs",
    "College education is overrated",
    "Work from home is better than office",
    "Cryptocurrency is the future of money",
    "Space exploration is a waste of money",
    "Reservations should be abolished in India",
    "Cricket is more important than education in India",
    "Electric vehicles will replace petrol cars by 2035",
    "Online learning is better than classroom learning"
  ];

  const sendArgument = async (endDebate = false) => {
    if (!argument.trim() && !endDebate) return;
    setLoading(true);

    const userMessage = { role: "user", content: argument };
    const newHistory = endDebate ? history : [...history, userMessage];

    try {
      const res = await fetch("http://localhost:8000/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: customTopic || topic,
          user_argument: endDebate ? "End the debate and give me my final score and feedback." : argument,
          history: history,
          difficulty: difficulty,
          end_debate: endDebate
        }),
      });

      const data = await res.json();

      if (endDebate) {
        setFinalResult(data.response);
      } else {
        const aiMessage = { role: "assistant", content: data.response };
        setHistory([...newHistory, aiMessage]);
      }
      setArgument("");
    } catch (error) {
      alert("Error connecting to backend!");
    }
    setLoading(false);
  };

  if (finalResult) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-yellow-400 mb-8">
            🏆 Debate Results
          </h1>
          <div className="bg-gray-800 rounded-2xl p-8 whitespace-pre-wrap text-lg leading-relaxed">
            {finalResult}
          </div>
          <button
            onClick={() => { setFinalResult(null); setHistory([]); setGameStarted(false); setTopic(""); }}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-xl"
          >
            🔄 Start New Debate
          </button>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-blue-400 mb-2">
            🎙️ AI Debate Coach
          </h1>
          <p className="text-center text-gray-400 mb-8">
            Practice debating with AI — get scored & improve!
          </p>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">Select Difficulty:</h2>
            <div className="flex gap-4">
              {["easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-3 rounded-xl font-bold capitalize text-lg ${
                    difficulty === d
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {d === "easy" ? "😊 Easy" : d === "medium" ? "😤 Medium" : "😈 Hard"}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">Choose a Topic:</h2>
            <div className="grid grid-cols-1 gap-3">
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`p-4 rounded-xl text-left font-medium ${
                    topic === t
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">Or Enter Custom Topic:</h2>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Type your own debate topic..."
              className="w-full p-4 bg-gray-700 rounded-xl text-white placeholder-gray-400 text-lg"
            />
          </div>

          <button
            onClick={() => { if (topic || customTopic) setGameStarted(true); }}
            disabled={!topic && !customTopic}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-4 rounded-xl text-xl"
          >
            🚀 Start Debate!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-800 p-4 text-center">
        <h1 className="text-2xl font-bold text-blue-400">🎙️ AI Debate Coach</h1>
        <p className="text-gray-400 text-sm mt-1">Topic: {customTopic || topic}</p>
        <span className="text-xs bg-blue-900 text-blue-300 px-3 py-1 rounded-full capitalize">
          {difficulty} mode
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-4xl mb-4">🎯</p>
            <p className="text-xl">Make your opening argument!</p>
            <p className="text-sm mt-2">The AI will argue the opposite side</p>
          </div>
        )}
        {history.map((msg: any, i: number) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-100"
            }`}>
              <p className="text-xs font-bold mb-1 opacity-70">
                {msg.role === "user" ? "You 🧑" : "AI Opponent 🤖"}
              </p>
              <p className="leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 p-4 rounded-2xl">
              <p className="text-gray-400">AI is thinking... 🤔</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-800 space-y-3">
        <textarea
          value={argument}
          onChange={(e) => setArgument(e.target.value)}
          placeholder="Type your argument here..."
          className="w-full p-4 bg-gray-700 rounded-xl text-white placeholder-gray-400 resize-none"
          rows={3}
        />
        <div className="flex gap-3">
          <button
            onClick={() => sendArgument(false)}
            disabled={loading || !argument.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-xl"
          >
            {loading ? "Thinking... 🤔" : "Send Argument 🎯"}
          </button>
          <button
            onClick={() => sendArgument(true)}
            disabled={loading || history.length === 0}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl"
          >
            🏆 End & Score
          </button>
        </div>
      </div>
    </div>
  );
}
