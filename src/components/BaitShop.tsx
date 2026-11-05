import { useState } from "react";
import type { ReactNode } from "react";
import type { Level } from "../data/messages";
import { WATERS } from "../data/species";
import { BOATS, BOBBERS, RODS, rodById, THEMES } from "../game/catalog";
import type { Slot } from "../game/catalog";
import { oddsFor, RARITIES, RARITY } from "../game/rarity";

interface ShopItem {
  id: string;
  name: string;
  price: number;
}

const START_ITEMS = new Set<string>([RODS[0].id, BOBBERS[0].id, BOATS[0].id, THEMES[0].id]);

function Tag({
  item,
  slot,
  coins,
  owned,
  equipped,
  onBuy,
  onEquip,
  swatch,
  children,
}: {
  item: ShopItem;
  slot: Slot;
  coins: number;
  owned: string[];
  equipped: Record<Slot, string>;
  onBuy: (slot: Slot, id: string, price: number) => void;
  onEquip: (slot: Slot, id: string) => void;
  swatch: ReactNode;
  children?: ReactNode;
}) {
  const isOwned = START_ITEMS.has(item.id) || owned.includes(`${slot}:${item.id}`);
  const isOn = equipped[slot] === item.id;
  const short = item.price - coins;
  return (
    <article className={`price-tag ${isOn ? "equipped" : ""}`}>
      <span className="tag-hole" aria-hidden="true" />
      <div className="tag-swatch">{swatch}</div>
      <h3>{item.name}</h3>
      {children}
      {isOn ? (
        <p className="tag-state">In use</p>
      ) : isOwned ? (
        <button className="tag-btn" onClick={() => onEquip(slot, item.id)}>
          Use this
        </button>
      ) : (
        <button
          className="tag-btn buy"
          disabled={short > 0}
          onClick={() => onBuy(slot, item.id, item.price)}
          title={short > 0 ? `${short}c short` : undefined}
        >
          {item.price}c{short > 0 ? <small> ({short} short)</small> : " Buy"}
        </button>
      )}
    </article>
  );
}

function RodSwatch({ blank, grip, reel }: { blank: string; grip: string; reel: string }) {
  return (
    <svg viewBox="0 0 160 44" aria-hidden="true">
      <path d="M4 36 Q80 28 156 6" stroke={blank} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M4 36 L44 32" stroke={grip} strokeWidth="7" strokeLinecap="round" />
      <rect x="50" y="32" width="14" height="10" rx="3" fill={reel} />
    </svg>
  );
}

function BobberSwatch({ top, bottom }: { top: string; bottom: string }) {
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true">
      <path d="M22 0 V12" stroke="#2a2118" strokeWidth="2" />
      <path d="M8 26 A14 14 0 0 1 36 26 Z" fill={top} />
      <path d="M8 26 A14 14 0 0 0 36 26 Z" fill={bottom} />
      <rect x="7" y="24.6" width="30" height="2.8" fill="#231a14" />
    </svg>
  );
}

function BoatSwatch({ hull, rim, seat, box }: { hull: string; rim: string; seat: string; box: string }) {
  return (
    <svg viewBox="0 0 160 44" aria-hidden="true">
      <path d="M6 44 C30 16 60 6 80 4 C100 6 130 16 154 44 Z" fill={rim} />
      <path d="M18 44 C40 22 64 14 80 12 C96 14 120 22 142 44 Z" fill={hull} />
      <path d="M38 36 Q80 26 122 36 L124 42 Q80 32 36 42 Z" fill={seat} />
      <rect x="98" y="22" width="20" height="12" fill={box} />
    </svg>
  );
}

const SHELVES: { id: Slot; label: string }[] = [
  { id: "rod", label: "Rods" },
  { id: "bobber", label: "Bobbers" },
  { id: "boat", label: "Boat paint" },
  { id: "theme", label: "Themes" },
];

export default function BaitShop({
  coins,
  owned,
  equipped,
  level,
  onBuy,
  onEquip,
  onReset,
}: {
  coins: number;
  owned: string[];
  equipped: Record<Slot, string>;
  level: Level;
  onBuy: (slot: Slot, id: string, price: number) => void;
  onEquip: (slot: Slot, id: string) => void;
  onReset: () => void;
}) {
  const [shelf, setShelf] = useState<Slot>("rod");
  const [armReset, setArmReset] = useState(false);
  const shared = { coins, owned, equipped, onBuy, onEquip };
  const rod = rodById(equipped.rod);
  const odds = oddsFor(level, rod.luck);

  return (
    <section className="panel" aria-label="Bait shop">
      <div className="shop">
        <header className="shop-head">
          <div className="shop-sign">
            <p>Live bait, cold drinks &amp;</p>
            <h2>Gladesman Tackle</h2>
          </div>
          <div className="till">
            <span>In your purse</span>
            <b className="coin-text">{coins}c</b>
          </div>
        </header>

        <nav className="shelves" aria-label="Shop shelves">
          {SHELVES.map((s) => (
            <button key={s.id} className={`shelf-btn ${shelf === s.id ? "on" : ""}`} onClick={() => setShelf(s.id)}>
              {s.label}
            </button>
          ))}
        </nav>

        {shelf === "rod" && (
          <div className="odds">
            <p className="odds-head">
              What's biting at <b>{WATERS[level].name}</b> on your {rod.name}
            </p>
            <div className="odds-bar" aria-hidden="true">
              {RARITIES.map((r) =>
                odds[r] > 0 ? <i key={r} style={{ flexGrow: odds[r], background: RARITY[r].color }} /> : null,
              )}
            </div>
            <ul className="odds-list">
              {RARITIES.map((r) => (
                <li key={r}>
                  <i style={{ background: RARITY[r].color }} />
                  {RARITY[r].label} <b>{odds[r] < 1 && odds[r] > 0 ? odds[r].toFixed(1) : Math.round(odds[r])}%</b>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pegboard">
          {shelf === "rod" &&
            RODS.map((x) => (
              <Tag key={x.id} item={x} slot="rod" {...shared} swatch={<RodSwatch {...x} />}>
                <p className="tag-blurb">{x.blurb}</p>
                <p className="tag-perk">
                  {x.luck ? `+${Math.round(x.luck * 100)}% rare luck, bites ${Math.round((1 - x.bite) * 100)}% faster` : "No bonus"}
                </p>
              </Tag>
            ))}
          {shelf === "bobber" &&
            BOBBERS.map((x) => <Tag key={x.id} item={x} slot="bobber" {...shared} swatch={<BobberSwatch {...x} />} />)}
          {shelf === "boat" &&
            BOATS.map((x) => <Tag key={x.id} item={x} slot="boat" {...shared} swatch={<BoatSwatch {...x} />} />)}
          {shelf === "theme" &&
            THEMES.map((x) => (
              <Tag
                key={x.id}
                item={x}
                slot="theme"
                {...shared}
                swatch={
                  <span className="theme-swatch" style={{ background: `linear-gradient(${x.swatch[0]} 0 25%, ${x.swatch[1]} 25% 50%, ${x.swatch[2]} 50% 75%, ${x.swatch[3]} 75%)` }} />
                }
              >
                <p className="tag-blurb">{x.blurb}</p>
              </Tag>
            ))}
        </div>

        <footer className="shop-foot">
          <button
            className={`burn ${armReset ? "armed" : ""}`}
            onBlur={() => setArmReset(false)}
            onClick={() => {
              if (!armReset) return setArmReset(true);
              onReset();
              setArmReset(false);
            }}
          >
            {armReset ? "Really? Wipes every fish, coin and purchase" : "Burn the log and start over"}
          </button>
        </footer>
      </div>
    </section>
  );
}
