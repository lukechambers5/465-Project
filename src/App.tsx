import { useState } from "react";
import { MESSAGES } from "./data/messages";
import type { Level, Message } from "./data/messages";
import "./App.css";

const LEVELS: Level[] = ["pond", "river", "ocean"];

interface Feedback {
  correct: boolean;
  fish: Message;
}

export default function App() {
  const [level, setLevel] = useState<Level>("pond");
  const [fish, setFish] = useState<Message | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [guide, setGuide] = useState<Message[]>([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [tab, setTab] = useState<"game" | "guide">("game");

  const pool = MESSAGES.filter(
    (m) => LEVELS.indexOf(m.level) <= LEVELS.indexOf(level)
  );

  function cast() {
    const next = pool[Math.floor(Math.random() * pool.length)];
    setFeedback(null);
    setFish(next);
  }

  function decide(reel: boolean) {
    if (!fish) return;
    const correct = reel === fish.isPhish;
    setScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));
    if (reel && fish.isPhish) {
      setGuide((g) =>
        g.find((x) => x.technique === fish.technique) ? g : [...g, fish]
      );
    }
    setFeedback({ correct, fish });
    setFish(null);
  }

  return (
    <div className="app">
      <h1>🎣 Phish Fishing</h1>
      <nav>
        <button onClick={() => setTab("game")} className={tab === "game" ? "on" : ""}>
          Pond
        </button>
        <button onClick={() => setTab("guide")} className={tab === "guide" ? "on" : ""}>
          Field Guide ({guide.length})
        </button>
      </nav>

      {tab === "game" && (
        <>
          <div className="bar">
            <label>
              Level:{" "}
              <select value={level} onChange={(e) => setLevel(e.target.value as Level)}>
                {LEVELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <span>
              Score: {score.correct}/{score.total}
            </span>
          </div>

          <div className="pond">
            {!fish && <div className="swim">🐟</div>}
            {fish && <div className="bite">🐠 Something's biting!</div>}
          </div>

          {!fish && (
            <button className="cast" onClick={cast}>
              {feedback ? "Cast again" : "Cast line"}
            </button>
          )}

          {fish && (
            <div className="card">
              <div className="meta">{fish.channel}</div>
              <div>
                <strong>From:</strong> {fish.from}
              </div>
              <p>{fish.body}</p>
              <div className="actions">
                <button className="reel" onClick={() => decide(true)}>
                  🎣 Reel in (phishing)
                </button>
                <button className="release" onClick={() => decide(false)}>
                  🌊 Release (legit)
                </button>
              </div>
            </div>
          )}

          {feedback && (
            <div className={`card feedback ${feedback.correct ? "good" : "bad"}`}>
              <h3>{feedback.correct ? "Correct!" : "Not quite."}</h3>
              <p>
                This was <strong>{feedback.fish.isPhish ? "phishing" : "legitimate"}</strong>
                {feedback.fish.isPhish &&
                  ` (${feedback.fish.technique}, lever: ${feedback.fish.lever})`}
                .
              </p>
              <ul>
                {feedback.fish.flags.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {tab === "guide" && (
        <div>
          {guide.length === 0 && <p>No phish caught yet. Go fishing!</p>}
          {guide.map((g) => (
            <div className="card" key={g.technique}>
              <h3>{g.technique}</h3>
              <div className="meta">
                Channel: {g.channel} · Lever: {g.lever}
              </div>
              <ul>
                {g.flags.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}