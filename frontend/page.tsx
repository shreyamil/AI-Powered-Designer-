"use client";

import { useState } from "react";
import axios from "axios";

interface Message {
  question: string;
  answer: string[] | null;
  numbered?: boolean;
  plot?: string | null;
}

export default function Home() {
  const [length, setLength] = useState("5"); // default 5m
  const [breadth, setBreadth] = useState("5"); // default 5m
  const [aesthetic, setAesthetic] = useState("");
  const [furniture, setFurniture] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { question: prompt, answer: null, plot: null },
    ]);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/design",
        {
          length: parseFloat(length),
          breadth: parseFloat(breadth),
          aesthetic,
          furniture,
          prompt,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const rawSuggestions = response.data.suggestions || "";
      const suggestionArray = rawSuggestions
        .split(/\n|\. /)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      const isNumbered = /^[0-9]+\./.test(suggestionArray[0] || "");

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].answer = suggestionArray;
        updated[updated.length - 1].numbered = isNumbered;
        updated[updated.length - 1].plot = response.data.plot_base64 || null;
        return updated;
      });
    } catch (err) {
      console.error(err);
      alert("Error generating design. Try again!");
    } finally {
      setLoading(false);
      setPrompt("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">
        AI Interior Designer
      </h1>

      {/* Input Form */}
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-3xl flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Room dimensions */}
          <div className="grid grid-cols-2 gap-6">
            {/* Length */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1 text-left">
                Length (m)
              </label>
              <input
                type="number"
                min={1}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                placeholder="Enter length"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </div>

            {/* Breadth */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1 text-left">
                Breadth (m)
              </label>
              <input
                type="number"
                min={1}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                placeholder="Enter breadth"
                value={breadth}
                onChange={(e) => setBreadth(e.target.value)}
              />
            </div>
          </div>

          {/* Aesthetic preferences */}
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            placeholder="Enter aesthetic preferences (e.g., Minimalist, Cozy, Modern)..."
            value={aesthetic}
            onChange={(e) => setAesthetic(e.target.value)}
            rows={2}
          />

          {/* Furniture preferences */}
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            placeholder="Enter furniture preferences (e.g., Sofa, Coffee Table, Bed)..."
            value={furniture}
            onChange={(e) => setFurniture(e.target.value)}
            rows={2}
          />

          {/* User prompt */}
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            placeholder="Describe your room or what you want..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />

          <button
            type="submit"
            disabled={loading}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md transition-all duration-300 transform ${
              loading ? "opacity-50 scale-95 cursor-not-allowed" : "hover:scale-105"
            }`}
          >
            {loading ? "Generating..." : "Get Suggestions"}
          </button>
        </form>
      </div>

      {/* Chat container */}
      <div className="mt-6 w-full max-w-3xl flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-4"
          >
            <p className="font-semibold text-gray-800">You:</p>
            <p className="text-gray-700 whitespace-pre-line">{msg.question}</p>

            {msg.answer && (
              <>
                <p className="font-semibold text-gray-800 mt-2">
                  AI Suggestions:
                </p>

                {(msg.numbered) ? (
                  <ol className="list-decimal list-inside text-gray-700 space-y-1">
                    {msg.answer.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ol>
                ) : (
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {msg.answer.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {msg.plot && (
              <div className="flex flex-col items-center mt-4">
                <p className="font-semibold text-gray-800 mb-2">Room Layout:</p>
                <img
                  src={`data:image/png;base64,${msg.plot}`}
                  alt="Room Layout"
                  className="rounded-lg shadow-md max-w-full"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
