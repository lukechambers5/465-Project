import { MESSAGES } from "../data/messages";
import { guideFishFor } from "../data/species";
import { RARITIES, RARITY } from "../game/rarity";
import Fish from "../scene/Fish";

// One plate per phishing technique, easiest first. Empty plates show how much is
// still out there without naming what it is.
const ALL_PHISH = MESSAGES.filter((m) => m.isPhish).sort(
  (a, b) => RARITIES.indexOf(a.rarity) - RARITIES.indexOf(b.rarity),
);

export default function FieldGuide({ caught, onClose }: { caught: number[]; onClose: () => void }) {
  const count = ALL_PHISH.filter((m) => caught.includes(m.id)).length;
  return (
    <section className="panel" aria-label="Field guide">
      <div className="guide-page">
        <div className="tape" aria-hidden="true" />
        <header className="guide-head">
          <p className="guide-kicker">A pocket field guide to the</p>
          <h2>Phishes of South Florida</h2>
          <p className="guide-count">
            {count} of {ALL_PHISH.length} techniques caught and described
          </p>
          <button className="guide-close" onClick={onClose}>
            Back to the water
          </button>
        </header>

        {count === 0 && (
          <p className="scrawl guide-empty">
            pages are empty, go catch something. only a phish you reel in gets written down.
          </p>
        )}

        <div className="plates">
          {ALL_PHISH.map((m, i) => {
            const n = i + 1;
            const tier = RARITY[m.rarity];
            if (!caught.includes(m.id)) {
              return (
                <article className="plate plate-empty" key={m.id}>
                  <span className="plate-no">
                    Plate {n} · <b style={{ color: tier.ink }}>{tier.label}</b>
                  </span>
                  <Fish kind={guideFishFor(m.technique)} className="print" silhouette />
                  <p className="scrawl">not caught yet. still out there.</p>
                </article>
              );
            }
            return (
              <article className="plate" key={m.id}>
                <span className="plate-no">
                  Plate {n} · <b style={{ color: tier.ink }}>{tier.label}</b>
                </span>
                <Fish kind={guideFishFor(m.technique)} className="print" />
                <h3>{m.technique}</h3>
                <dl className="plate-facts">
                  <div>
                    <dt>Waters</dt>
                    <dd>{m.channel}</dd>
                  </div>
                  <div>
                    <dt>Bait</dt>
                    <dd>{m.lever}</dd>
                  </div>
                </dl>
                <h4>How to spot one</h4>
                <ul className="tells">
                  {m.flags.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
