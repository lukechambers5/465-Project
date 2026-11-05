import { useEffect, useRef, useState } from "react";
import { MESSAGES } from "./data/messages";
import type { Level, Message } from "./data/messages";
import BaitShop from "./components/BaitShop";
import FieldGuide from "./components/FieldGuide";
import Livewell from "./components/Livewell";
import { BiteNote, VerdictNote } from "./components/Notebook";
import Signpost from "./components/Signpost";
import type { Tab } from "./components/Signpost";
import { boatById, bobberById, rodById } from "./game/catalog";
import type { Slot } from "./game/catalog";
import { fishValue, generateFish } from "./game/fishgen";
import type { CaughtFish } from "./game/fishgen";
import { RARITIES, rollRarity } from "./game/rarity";
import { loadSave, NEW_SAVE, writeSave } from "./game/save";
import { guideFishFor } from "./data/species";
import { Grain, Scene } from "./scene/Scene";
import Tackle, { CAST_MS } from "./scene/Tackle";
import type { Phase } from "./scene/Tackle";
import "./App.css";

const WAITING_LINES = [
  "Hush now. Something's nosing around.",
  "Bobber's still. Water ain't.",
  "Mind the gator.",
  "Skeeters are biting, at least.",
  "Give it a minute.",
  "Saw something roll, over by the reeds.",
];

const PHISH_CHANCE = 0.65;

/** Rolls a tier for this water and rod, then a message in that tier. */
function nextMessage(level: Level, luck: number, recent: number[]): Message {
  const wantPhish = Math.random() < PHISH_CHANCE;
  const tier = RARITIES.indexOf(rollRarity(level, luck));
  // If a tier has no message of this kind, step down to the nearest tier that does.
  for (let t = tier; t >= 0; t--) {
    const all = MESSAGES.filter((m) => m.isPhish === wantPhish && m.rarity === RARITIES[t]);
    if (all.length === 0) continue;
    const fresh = all.filter((m) => !recent.includes(m.id));
    const from = fresh.length ? fresh : all;
    return from[Math.floor(Math.random() * from.length)];
  }
  return MESSAGES[0];
}

interface Feedback {
  reel: boolean;
  fish: Message;
  caught: CaughtFish | null;
}

export default function App() {
  const [save, setSave] = useState(loadSave);
  const [phase, setPhase] = useState<Phase>("idle");
  const [fish, setFish] = useState<Message | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [tab, setTab] = useState<Tab>("game");
  const [waitLine, setWaitLine] = useState(WAITING_LINES[0]);
  const recent = useRef<number[]>([]);

  const { level, score, coins, equipped } = save;
  const rod = rodById(equipped.rod);

  useEffect(() => writeSave(save), [save]);

  // The line goes out, settles, then something takes it.
  useEffect(() => {
    if (phase === "casting") {
      const t = setTimeout(() => setPhase("waiting"), CAST_MS);
      return () => clearTimeout(t);
    }
    if (phase === "waiting") {
      const wait = (1400 + Math.random() * 2200) * rod.bite;
      const t = setTimeout(() => setPhase("bite"), wait);
      return () => clearTimeout(t);
    }
  }, [phase, rod.bite]);

  function cast() {
    const next = nextMessage(level, rod.luck, recent.current);
    recent.current = [next.id, ...recent.current].slice(0, 6);
    setFeedback(null);
    setFish(next);
    setWaitLine(WAITING_LINES[Math.floor(Math.random() * WAITING_LINES.length)]);
    setPhase("casting");
  }

  function decide(reel: boolean) {
    if (!fish) return;
    const correct = reel === fish.isPhish;
    const caught = reel && fish.isPhish ? generateFish(level, fish.rarity, fish.technique) : null;
    setSave((s) => ({
      ...s,
      score: { correct: s.score.correct + (correct ? 1 : 0), total: s.score.total + 1 },
      fish: caught ? [caught, ...s.fish] : s.fish,
      guide: caught && !s.guide.includes(fish.id) ? [...s.guide, fish.id] : s.guide,
    }));
    setFeedback({ reel, fish, caught });
    setFish(null);
    setPhase("landed");
  }

  function sell(ids: string[]) {
    setSave((s) => {
      const going = s.fish.filter((f) => ids.includes(f.id));
      return {
        ...s,
        coins: s.coins + going.reduce((sum, f) => sum + fishValue(f), 0),
        fish: s.fish.filter((f) => !ids.includes(f.id)),
      };
    });
  }

  function buy(slot: Slot, id: string, price: number) {
    setSave((s) =>
      s.coins < price
        ? s
        : {
            ...s,
            coins: s.coins - price,
            owned: [...s.owned, `${slot}:${id}`],
            equipped: { ...s.equipped, [slot]: id },
          },
    );
  }

  function resetAll() {
    setSave(NEW_SAVE);
    setFish(null);
    setFeedback(null);
    setPhase("idle");
  }

  // Each miss lets the gator drift in; good calls back it off a little.
  const misses = score.total - score.correct;
  const dread = Math.min(1, Math.max(0, misses * 2 - score.correct) / 6);
  const lineOut = phase === "casting" || phase === "waiting" || phase === "bite";

  const landed = feedback
    ? {
        caught: feedback.caught,
        printKind: feedback.fish.isPhish ? guideFishFor(feedback.fish.technique) : ("mullet" as const),
        reeled: feedback.reel,
      }
    : null;

  return (
    <div className="world" data-level={level} data-phase={phase} data-tab={tab}>
      <div className="scene">
        <Scene level={level} dread={dread} theme={equipped.theme} boat={boatById(equipped.boat)} />
        <Tackle phase={phase} landed={landed} rod={rod} bobber={bobberById(equipped.bobber)} />
        <Grain />
      </div>

      <Signpost
        tab={tab}
        onTab={setTab}
        fishCount={save.fish.length}
        guideCount={save.guide.length}
        coins={coins}
        level={level}
        onLevel={(l) => setSave((s) => ({ ...s, level: l }))}
        lineOut={lineOut}
        score={score}
      />

      {tab === "game" && (
        <main className="stage">
          {phase === "idle" && (
            <div className="prompt">
              <p className="prompt-line">Something's out there.</p>
              <button className="bobber-btn" onClick={cast}>
                <span className="bobber-mark" aria-hidden="true" />
                Cast your line
              </button>
            </div>
          )}

          {(phase === "casting" || phase === "waiting") && (
            <div className="prompt" role="status">
              <p className="prompt-line waiting">{phase === "casting" ? "There she goes..." : waitLine}</p>
            </div>
          )}

          {phase === "bite" && fish && (
            <div className="desk haul-up">
              <BiteNote key={fish.id} fish={fish} onDecide={decide} />
            </div>
          )}

          {phase === "landed" && feedback && (
            <div className="desk">
              <VerdictNote fish={feedback.fish} reel={feedback.reel} caught={feedback.caught} onCast={cast} />
            </div>
          )}
        </main>
      )}

      {tab === "livewell" && (
        <Livewell
          fish={save.fish}
          coins={coins}
          onSell={(id) => sell([id])}
          onSellMany={sell}
          onGoFish={() => setTab("game")}
        />
      )}

      {tab === "shop" && (
        <BaitShop
          coins={coins}
          owned={save.owned}
          equipped={equipped}
          level={level}
          onBuy={buy}
          onEquip={(slot, id) => setSave((s) => ({ ...s, equipped: { ...s.equipped, [slot]: id } }))}
          onReset={resetAll}
        />
      )}

      {tab === "guide" && <FieldGuide caught={save.guide} onClose={() => setTab("game")} />}
    </div>
  );
}
