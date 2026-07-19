import { useEffect, useEffectEvent, useRef } from "react";
import { useTranslation } from "react-i18next";

import { IconCheck } from "../../../libs/icons/Check";
import { IconRemoveSelection } from "../../../libs/icons/RemoveSelection";
import { computeMenuPosition } from "./menuPosition";
import type { CellClaimMenu as CellClaimMenuState } from "./useCellInteraction";

type Props = {
  cellIndex: number;
  menu: CellClaimMenuState;
};

// A simple, fixed quick-pick palette rather than a full emoji-picker
// dependency — the free-text input below still takes any emoji (or short
// text) for anything not in this list.
const QUICK_MEMO_EMOJIS = ["👍", "🤔", "😇", "💩"];

// Built on the native Popover API (see src/routes/index.css for the
// `.cell-claim-popover` rules) instead of the old fixed-backdrop/
// absolute-inset-0 grid: `popover="auto"` gives free light-dismiss
// (click-outside) and Escape-to-close via the browser's own popover stack,
// so there's no manual backdrop div or keydown listener to maintain — both
// are replaced by the native `toggle` event below.
export const CellClaimMenu = ({ cellIndex, menu }: Props) => {
  const { t } = useTranslation();
  const popoverRef = useRef<HTMLUListElement>(null);

  const onToggle = useEffectEvent((e: Event) => {
    if ((e as ToggleEvent).newState === "closed") {
      menu.onClose();
    }
  });

  // Positions the popover next to whichever cell opened it — computed by
  // hand (computeMenuPosition) rather than via CSS anchor positioning's
  // `position-try-fallbacks: flip-block`, which looked like the built-in
  // tool for this but turned out not to reliably flip a `calc()`-wrapped
  // `anchor()` expression: confirmed by hand that a menu taller than the
  // space on both sides of a bottom-of-viewport cell stayed pinned below
  // it, extending hundreds of pixels past the bottom of the screen instead
  // of flipping above. Doing this ourselves, unconditionally, also means
  // one code path for every browser instead of a native/manual fork.
  //
  // Imperative show, not the declarative `popovertarget` attribute — this
  // menu's trigger is a right-click on the cell itself, not a dedicated
  // button, so there's nothing to attach `popovertarget` to.
  useEffect(() => {
    const el = popoverRef.current;
    const cell = el?.parentElement;
    if (!el || !cell) {
      return;
    }

    // showPopover() throws if called on an already-open popover — guard it,
    // since this effect re-runs on every `menu` identity change (i.e. every
    // re-render while the menu is open) to keep onToggle's closure current.
    if (!el.matches(":popover-open")) {
      el.showPopover();
    }

    const reposition = () => {
      const cellRect = cell.getBoundingClientRect();
      const menuRect = el.getBoundingClientRect();
      const { top, left } = computeMenuPosition(
        cellRect,
        menuRect,
        { width: window.innerWidth, height: window.innerHeight },
        4,
      );
      el.style.top = "0px";
      el.style.left = "0px";
      el.style.transform = `translate(${left}px, ${top}px)`;
    };
    reposition();

    // Scroll events don't bubble, but they do reach a capturing listener
    // on an ancestor (including window) before the scrolled element sees
    // them — this is what lets the menu keep tracking its cell if the
    // page (or a popup window's own scroll container) moves while it's
    // open, the one thing switching off CSS anchor positioning would
    // otherwise have given up for free.
    window.addEventListener("scroll", reposition, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", reposition);
    el.addEventListener("toggle", onToggle);
    return () => {
      window.removeEventListener("scroll", reposition, { capture: true });
      window.removeEventListener("resize", reposition);
      el.removeEventListener("toggle", onToggle);
    };
  }, [cellIndex, menu]);

  return (
    <ul
      ref={popoverRef}
      popover="auto"
      className="cell-claim-popover menu menu-sm bg-base-100 border-base-300 rounded-box gap-1 border p-1 shadow-lg"
    >
      {menu.rows
        .filter((row) => row.onToggle !== undefined)
        .map((row) => (
          <li key={row.team.id}>
            <button
              disabled={!row.onToggle}
              title={
                row.onToggle
                  ? undefined
                  : t("room.claimMenu.locked", { team: row.team.name })
              }
              onClick={() => row.onToggle?.()}
            >
              <span
                className="size-4 rounded-full"
                style={{ backgroundColor: row.team.color }}
              />
              <span className="flex-1 text-left">{row.team.name}</span>
              {row.claimed && (
                <span className="size-4 fill-current">
                  <IconCheck />
                </span>
              )}
            </button>
          </li>
        ))}
      {menu.onClearAll && (
        <li>
          <button onClick={menu.onClearAll}>
            <span className="size-4 fill-current">
              <IconRemoveSelection />
            </span>
            {t("room.claimMenu.clearAll")}
          </button>
        </li>
      )}
      {menu.memoRows.length > 0 && (
        <>
          {menu.memoRows.map((row) => (
            <li key={row.team.id}>
              <div className="grid gap-1">
                <div className="flex items-center gap-1">
                  <span
                    className="size-4 shrink-0 rounded-full"
                    style={{ backgroundColor: row.team.color }}
                  />
                  <div className="flex flex-wrap gap-1">
                    {QUICK_MEMO_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`btn btn-md btn-circle ${row.value === emoji ? "btn-active" : "btn-ghost"}`}
                        aria-label={emoji}
                        onClick={() =>
                          row.onChange(row.value === emoji ? undefined : emoji)
                        }
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </>
      )}
    </ul>
  );
};
