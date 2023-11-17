"use client";
import { PGChunk } from "@/types";
import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [chunks, setChunks] = useState<PGChunk[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnswer = async () => {
    setLoading(true);

    const searchResponse = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!searchResponse.ok) {
      return;
    }

    const results: PGChunk[] = await searchResponse.json();
    setChunks(results);

    const prompt = `
      Use the following passages to answer the query: ${query}
      ${results.map((chunk) => chunk.content).join("\n")}
    `;
    console.log(prompt);

    const answerResponse = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!answerResponse.ok) {
      return;
    }
    
    const data = await answerResponse.json();
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setAnswer((prev) => prev + chunkValue);
    }
  };

  return (
    <>
      <Head>
        <title>Essay GPT</title>
        <meta
          name="description"
          content="AI Q&A on PG's essays."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>
      <div className="flex items-center justify-center h-screen bg-gray-200">
        <div>
          <input
            className="border text-black border-gray-300 rounded-md p-2 mb-4"
            type="text"
            placeholder="How do I start a startup?"
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleAnswer}
          >
            Submit
          </button>
          <div className="mt-4">
            {loading && <div>Loading...</div>}
            {!loading && <div>{answer}</div>}
          </div>
        </div>
      </div>
    </>
  );
}
