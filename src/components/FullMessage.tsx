import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Message } from "../data/messages";

const IDLE_STATUS = "Hover or tap a link to see where it really goes.";

/**
 * The whole message on a bigger page of the same notebook, available for every
 * message so that opening it says nothing about the answer. Links are shown,
 * never followed: they only report their destination in the status bar.
 */
export default function FullMessage({ fish, onClose }: { fish: Message; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState(IDLE_STATUS);
  const paragraphs = fish.paragraphs ?? [fish.body];

  useEffect(() => {
    const root = document.getElementById("root");
    const opener = document.activeElement as HTMLElement | null;
    // The game behind can't take focus or clicks while this is open.
    if (root) root.inert = true;
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (root) root.inert = false;
      opener?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="mail-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <article className="notebook mail-sheet" role="dialog" aria-modal="true" aria-label="Full message">
        <div className="spiral" aria-hidden="true" />
        <header className="mail-top">
          <h2>{fish.subject ?? `${fish.channel} message`}</h2>
          <button ref={close} className="mail-close" onClick={onClose}>
            Back to the card
          </button>
        </header>

        <dl className="slip mail-fields">
          <div>
            <dt>From</dt>
            <dd className="slip-from">{fish.from}</dd>
          </div>
          <div>
            <dt>To</dt>
            <dd>you</dd>
          </div>
          <div>
            <dt>Came in by</dt>
            <dd>{fish.channel}</dd>
          </div>
        </dl>

        <div className="mail-body">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {fish.links && (
            <p className="mail-links">
              {fish.links.map((l) => (
                <button
                  key={l.text}
                  type="button"
                  className="mail-link"
                  onClick={() => setStatus(l.href)}
                  onMouseEnter={() => setStatus(l.href)}
                  onMouseLeave={() => setStatus(IDLE_STATUS)}
                  onFocus={() => setStatus(l.href)}
                  onBlur={() => setStatus(IDLE_STATUS)}
                >
                  {l.text}
                </button>
              ))}
            </p>
          )}
          {fish.fold && (
            <>
              {/* The push-down itself: a tall blank gap you have to scroll past. */}
              <div className="mail-gap" aria-hidden="true" />
              <p>{fish.fold}</p>
            </>
          )}
        </div>

        {fish.attachments && (
          <ul className="mail-attachments" aria-label="Attachments">
            {fish.attachments.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        )}

        <p className="mail-status" role="status">
          {status}
        </p>

        <h3 className="mail-details-head">Message details</h3>
        <dl className="header-list">
          {fish.headers.map((h) => (
            <div key={h.label}>
              <dt>{h.label}</dt>
              <dd>{h.value}</dd>
            </div>
          ))}
        </dl>
      </article>
    </div>,
    document.body,
  );
}
