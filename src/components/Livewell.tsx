import { useEffect, useMemo, useRef, useState } from "react";
import { SPECIES, WATERS } from "../data/species";
import { RARITIES, RARITY } from "../game/rarity";
import type { Rarity } from "../game/rarity";
import type { CaughtFish } from "../game/fishgen";
import { fishName, fishValue, wearOf, WEARS } from "../game/fishgen";
import { SkinnedFish } from "../scene/Fish";

type Sort = "newest" | "value" | "rarity";

const tierOf = (r: Rarity) => RARITIES.indexOf(r);
const rarityVar = (r: Rarity) => ({ "--r": RARITY[r].color }) as React.CSSProperties;

function FloatBar({ float }: { float: number }) {
  return (
    <div className="float-bar" aria-hidden="true">
      {WEARS.map((w, i) => (
        <i key={w.name} style={{ flexGrow: w.max - (WEARS[i - 1]?.max ?? 0) }} />
      ))}
      <b style={{ left: `${float * 100}%` }} />
    </div>
  );
}

/** Selling is permanent, so it takes a second click on anything worth keeping. */
function SellButton({ fish, onSell }: { fish: CaughtFish; onSell: () => void }) {
  const [armed, setArmed] = useState(false);
  const careful = tierOf(fish.rarity) >= 2 || fish.trophy;
  const value = fishValue(fish);
  return (
    <button
      className={`sell ${armed ? "armed" : ""}`}
      onClick={() => {
        if (careful && !armed) setArmed(true);
        else onSell();
      }}
      onBlur={() => setArmed(false)}
    >
      {armed ? `Really sell it? ${value}c` : `Sell for ${value}c`}
    </button>
  );
}

export default function Livewell({
  fish,
  coins,
  onSell,
  onSellMany,
  onGoFish,
}: {
  fish: CaughtFish[];
  coins: number;
  onSell: (id: string) => void;
  onSellMany: (ids: string[]) => void;
  onGoFish: () => void;
}) {
  const [sort, setSort] = useState<Sort>("newest");
  const [only, setOnly] = useState<Rarity | "all">("all");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [armBulk, setArmBulk] = useState(false);

  const shown = useMemo(() => {
    const list = only === "all" ? [...fish] : fish.filter((f) => f.rarity === only);
    if (sort === "value") list.sort((a, b) => fishValue(b) - fishValue(a));
    if (sort === "rarity") list.sort((a, b) => tierOf(b.rarity) - tierOf(a.rarity) || fishValue(b) - fishValue(a));
    if (sort === "newest") list.sort((a, b) => b.caughtAt - a.caughtAt);
    return list;
  }, [fish, sort, only]);

  // The detail panel sits above the grid, so a low tile would open it off-screen.
  const detail = useRef<HTMLElement>(null);
  useEffect(() => {
    if (pickedId) detail.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [pickedId]);

  const picked = fish.find((f) => f.id === pickedId) ?? null;
  const worth = fish.reduce((sum, f) => sum + fishValue(f), 0);
  const commons = fish.filter((f) => f.rarity === "common" && !f.trophy);
  const commonsWorth = commons.reduce((sum, f) => sum + fishValue(f), 0);

  return (
    <section className="panel" aria-label="Livewell">
      <div className="well">
        <header className="well-head">
          <div>
            <p className="well-kicker">Everything still kicking in the</p>
            <h2>Livewell</h2>
          </div>
          <dl className="well-stats">
            <div>
              <dt>Fish</dt>
              <dd>{fish.length}</dd>
            </div>
            <div>
              <dt>Worth</dt>
              <dd>{worth}c</dd>
            </div>
            <div>
              <dt>Purse</dt>
              <dd className="coin-text">{coins}c</dd>
            </div>
          </dl>
        </header>

        {fish.length === 0 ? (
          <div className="well-empty">
            <p>Nothing but dirty water in here.</p>
            <p className="well-empty-sub">Reel in a phish and it comes home with its own one-of-a-kind skin.</p>
            <button className="bobber-btn" onClick={onGoFish}>
              <span className="bobber-mark" aria-hidden="true" />
              Go fishing
            </button>
          </div>
        ) : (
          <>
            <div className="well-tools">
              <div className="chips" role="group" aria-label="Filter by rarity">
                <button className={`chip ${only === "all" ? "on" : ""}`} onClick={() => setOnly("all")}>
                  All
                </button>
                {RARITIES.map((r) => (
                  <button key={r} className={`chip ${only === r ? "on" : ""}`} style={rarityVar(r)} onClick={() => setOnly(r)}>
                    {RARITY[r].label}
                  </button>
                ))}
              </div>
              <label className="sort">
                Sort
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                  <option value="newest">Newest</option>
                  <option value="value">Value</option>
                  <option value="rarity">Rarity</option>
                </select>
              </label>
              {commons.length > 1 && (
                <button
                  className={`sell bulk ${armBulk ? "armed" : ""}`}
                  onBlur={() => setArmBulk(false)}
                  onClick={() => {
                    if (!armBulk) return setArmBulk(true);
                    onSellMany(commons.map((f) => f.id));
                    setArmBulk(false);
                  }}
                >
                  {armBulk ? `Sure? ${commons.length} fish, ${commonsWorth}c` : `Sell all Commons, ${commonsWorth}c`}
                </button>
              )}
            </div>

            {picked && (
              <article ref={detail} className="well-detail" style={rarityVar(picked.rarity)}>
                <div className="detail-art">
                  <SkinnedFish fish={picked} className="detail-fish" />
                </div>
                <div className="detail-info">
                  <p className="tier-word">
                    {picked.trophy && <span className="trophy">Trophy </span>}
                    {RARITY[picked.rarity].label}
                  </p>
                  <h3>{fishName(picked)}</h3>
                  <p className="detail-latin">
                    <em>{SPECIES[picked.kind].latin}</em>, {picked.lbs} lb, from {WATERS[picked.level].name}
                  </p>
                  <FloatBar float={picked.float} />
                  <dl className="detail-facts">
                    <div>
                      <dt>Wear</dt>
                      <dd>
                        {wearOf(picked.float).name} ({picked.float.toFixed(4)})
                      </dd>
                    </div>
                    <div>
                      <dt>Pattern</dt>
                      <dd>#{picked.seed}</dd>
                    </div>
                    <div>
                      <dt>Caught on</dt>
                      <dd>{picked.technique}</dd>
                    </div>
                  </dl>
                  <div className="detail-actions">
                    <SellButton
                      key={picked.id}
                      fish={picked}
                      onSell={() => {
                        onSell(picked.id);
                        setPickedId(null);
                      }}
                    />
                    <button className="detail-close" onClick={() => setPickedId(null)}>
                      Keep it
                    </button>
                  </div>
                </div>
              </article>
            )}

            {shown.length === 0 && <p className="well-none">No {only} fish in the well.</p>}
            <ul className="tiles">
              {shown.map((f) => (
                <li key={f.id}>
                  <button
                    className={`tile tile-${f.rarity} ${pickedId === f.id ? "picked" : ""}`}
                    style={rarityVar(f.rarity)}
                    onClick={() => setPickedId(f.id)}
                    aria-pressed={pickedId === f.id}
                  >
                    {f.trophy && <span className="tile-star" title="Trophy: worth double">★</span>}
                    <SkinnedFish fish={f} className="tile-fish" />
                    <span className="tile-finish">{f.finish}</span>
                    <span className="tile-kind">{SPECIES[f.kind].name}</span>
                    <span className="tile-foot">
                      <span>{wearOf(f.float).name}</span>
                      <b>{fishValue(f)}c</b>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
