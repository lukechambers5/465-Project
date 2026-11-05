import type { Level } from "../data/messages";
import { WATERS } from "../data/species";

const LEVELS: Level[] = ["pond", "river", "ocean"];

export type Tab = "game" | "livewell" | "shop" | "guide";

/** Tally marks scratched into the catch board, in fives. */
function Tally({ count }: { count: number }) {
  const shown = Math.min(count, 20);
  const groups = Array.from({ length: Math.ceil(shown / 5) }, (_, g) =>
    Math.min(5, shown - g * 5),
  );
  return (
    <span className="tally" aria-hidden="true">
      {groups.map((marks, g) => (
        <svg key={g} viewBox="0 0 34 26" width="34" height="26">
          {Array.from({ length: Math.min(marks, 4) }, (_, i) => (
            <path key={i} d={`M${5 + i * 7} ${3 + (i % 2)} L${4 + i * 7 + (i % 2)} 23`} />
          ))}
          {marks === 5 && <path d="M1 20 L31 6" />}
        </svg>
      ))}
    </span>
  );
}

interface Props {
  tab: Tab;
  onTab: (tab: Tab) => void;
  fishCount: number;
  guideCount: number;
  coins: number;
  level: Level;
  onLevel: (level: Level) => void;
  /** Can't change waters with a line out. */
  lineOut: boolean;
  score: { correct: number; total: number };
}

export default function Signpost({ tab, onTab, fishCount, guideCount, coins, level, onLevel, lineOut, score }: Props) {
  const tabButton = (id: Tab, label: string, count?: number) => (
    <button className={`tag ${tab === id ? "on" : ""}`} onClick={() => onTab(id)}>
      {label}
      {count !== undefined && <b>{count}</b>}
    </button>
  );
  return (
    <aside className="post">
      <div className="post-beam" aria-hidden="true" />

      <header className="plank plank-title">
        <i className="nail nail-l" />
        <i className="nail nail-r" />
        <p className="title-kicker">Everglades, Fla.</p>
        <h1>
          Phish <span>Fishing</span>
        </h1>
      </header>

      <nav className="tags" aria-label="Sections">
        {tabButton("game", "On the water")}
        {tabButton("livewell", "Livewell", fishCount)}
        {tabButton("shop", "Bait shop")}
        {tabButton("guide", "Field guide", guideCount)}
      </nav>

      <div className="waters" role="group" aria-label="Choose your water">
        {LEVELS.map((l, i) => (
          <button
            key={l}
            className={`arrow arrow-${i} ${level === l ? "on" : ""}`}
            aria-pressed={level === l}
            disabled={lineOut && level !== l}
            title={lineOut && level !== l ? "Reel in before you move" : undefined}
            onClick={() => onLevel(l)}
          >
            <span className="arrow-name">{WATERS[l].name}</span>
            <span className="arrow-hint">{WATERS[l].hint}</span>
          </button>
        ))}
      </div>

      <div className="plank plank-log">
        <i className="nail nail-l" />
        <i className="nail nail-r" />
        <p className="log-coins">
          <span className="coin" aria-hidden="true" />
          <b>{coins}</b>
          <small> coins</small>
        </p>
        <p className="log-score" aria-label={`${score.correct} right out of ${score.total} casts`}>
          {score.correct}
          <small> of {score.total} called right</small>
        </p>
        <Tally count={score.correct} />
      </div>
    </aside>
  );
}
