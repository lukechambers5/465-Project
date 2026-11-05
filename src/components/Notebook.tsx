import { useState } from "react";
import type { Message } from "../data/messages";
import { guideFishFor, SPECIES } from "../data/species";
import type { CaughtFish } from "../game/fishgen";
import { fishName, fishValue, wearOf } from "../game/fishgen";
import { RARITY } from "../game/rarity";
import Fish, { SkinnedFish } from "../scene/Fish";

/** What came up on the hook: the message, on a page of a waterproof notebook. */
export function BiteNote({ fish, onDecide }: { fish: Message; onDecide: (reel: boolean) => void }) {
  const [showHeaders, setShowHeaders] = useState(false);
  return (
    <article className="notebook" aria-live="polite">
      <div className="spiral" aria-hidden="true" />
      <p className="fish-on">Fish on!</p>
      <dl className="slip">
        <div>
          <dt>Came in by</dt>
          <dd>{fish.channel}</dd>
        </div>
        <div>
          <dt>From</dt>
          <dd className="slip-from">{fish.from}</dd>
        </div>
        {fish.subject && (
          <div>
            <dt>Title</dt>
            <dd className="slip-subject">{fish.subject}</dd>
          </div>
        )}
      </dl>
      <div className={`slip-scroll ${fish.fold ? "has-fold" : ""}`} tabIndex={fish.fold ? 0 : undefined}>
        <p className="slip-body">{fish.body}</p>
        {fish.fold && (
          <>
            {/* The push-down itself: a tall blank gap the player has to scroll past. */}
            <div className="slip-gap" aria-hidden="true" />
            <p className="slip-body">{fish.fold}</p>
          </>
        )}
      </div>

      {fish.headers && (
        <div className="headers">
          <button className="headers-btn" aria-expanded={showHeaders} onClick={() => setShowHeaders((s) => !s)}>
            {showHeaders ? "Hide the raw headers" : "Pull the raw headers"}
          </button>
          {showHeaders && (
            <dl className="header-list">
              {fish.headers.map((h) => (
                <div key={h.label}>
                  <dt>{h.label}</dt>
                  <dd>{h.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      <p className="scrawl">well? what've you got...</p>
      <div className="calls">
        <button className="call call-reel" onClick={() => onDecide(true)}>
          <strong>Reel it in</strong>
          <span>this one's a phish</span>
        </button>
        <button className="call call-release" onClick={() => onDecide(false)}>
          <strong>Cut it loose</strong>
          <span>it's the real thing</span>
        </button>
      </div>
    </article>
  );
}

function verdictWords(reel: boolean, isPhish: boolean) {
  if (reel && isPhish) return { stamp: "Good catch", line: "Hooked it clean. It's in the livewell now." };
  if (!reel && !isPhish) return { stamp: "Clean release", line: "Nothing wrong with that one. Back it goes." };
  if (!reel && isPhish) return { stamp: "Got away", line: "That was a phish, and you let it swim. Gator's interested now." };
  return { stamp: "Out of season", line: "That was a legit message. Ranger's writing you up, and the gator heard the commotion." };
}

/** The pack-opening moment: this exact fish, on a light in its tier's color. */
function CatchReveal({ caught }: { caught: CaughtFish }) {
  const tier = RARITY[caught.rarity];
  return (
    <div className={`reveal reveal-${caught.rarity}`} style={{ "--r": tier.color } as React.CSSProperties}>
      <p className="tier-word">
        {caught.trophy && <span className="trophy">★ Trophy </span>}
        {tier.label}
      </p>
      <SkinnedFish fish={caught} className="reveal-fish" />
      <h2>{fishName(caught)}</h2>
      <p className="reveal-facts">
        {caught.lbs} lb · {wearOf(caught.float).name} · #{caught.seed} · <b>{fishValue(caught)}c</b>
      </p>
    </div>
  );
}

export function VerdictNote({
  fish,
  reel,
  caught,
  onCast,
}: {
  fish: Message;
  reel: boolean;
  caught: CaughtFish | null;
  onCast: () => void;
}) {
  const correct = reel === fish.isPhish;
  const words = verdictWords(reel, fish.isPhish);
  const tier = RARITY[fish.rarity];
  const printKind = fish.isPhish ? guideFishFor(fish.technique) : "mullet";
  return (
    <article className={`notebook verdict ${correct ? "good" : "bad"}`} aria-live="polite">
      <div className="spiral" aria-hidden="true" />
      <div className="stamp">{words.stamp}</div>
      <p className="verdict-line">{words.line}</p>

      {caught && <CatchReveal caught={caught} />}

      <div className={`verdict-id ${caught ? "no-print" : ""}`}>
        {!caught && <Fish kind={printKind} className="print" />}
        <div>
          <h2>{fish.isPhish ? fish.technique : "Legitimate message"}</h2>
          {!fish.isPhish && (
            <p className="latin">
              {SPECIES.mullet.name}, <em>{SPECIES.mullet.latin}</em>
            </p>
          )}
          {fish.isPhish && (
            <p className="bait">
              <b style={{ color: tier.ink }}>{tier.label}</b> phish · bait it used: <b>{fish.lever}</b>
            </p>
          )}
        </div>
      </div>

      {fish.headers && (
        <dl className="header-list verdict-headers">
          {fish.headers.map((h) => (
            <div key={h.label} className={h.tone ? `tone-${h.tone}` : undefined}>
              <dt>{h.label}</dt>
              <dd>{h.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <h3 className="tells-head">{fish.isPhish ? "The tells" : "Why it checks out"}</h3>
      <ul className="tells">
        {fish.flags.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <button className="bobber-btn in-note" onClick={onCast}>
        <span className="bobber-mark" aria-hidden="true" />
        Cast again
      </button>
    </article>
  );
}
