import { expect, test } from "@playwright/test";

import {
  APP_URL,
  boardCell,
  boardColors,
  closeRoomDialog,
  hostRoom,
  joinRoomAs,
  mulberry32,
  openRoomDialog,
  playersListText,
  shuffle,
} from "./helpers";

// Kept in sync with BOARD_SIZE ** 2 in src/features/store/board.ts — not
// imported directly since that module pulls in browser-only atoms
// (localStorage-backed jotai state) that don't run under Playwright's node
// context.
const CELLS_COUNT = 25;

type ClaimAction = { kind: "claim"; peer: "host" | "guest"; cell: number };
type RejoinAction = { kind: "rejoin" };
type Action = ClaimAction | RejoinAction;

// Exercises a randomized, black-box sequence of moves — deliberately
// *not* the tidy "host, then guest joins, then everyone claims in order"
// path the other spec covers — against the real running app over a real
// WebRTC connection. Regardless of the exact order (including a guest
// disconnecting and rejoining mid-sequence, which hands it a brand new
// peer id), the invariant under test is simple: both browsers must always
// agree pixel-for-pixel on the board once things settle. The seed is
// logged so a failure can be replayed via E2E_SEED=<seed>.
test("random claim/rejoin sequences leave host and guest boards identical", async ({
  browser,
}, testInfo) => {
  const seed = process.env.E2E_SEED
    ? Number(process.env.E2E_SEED)
    : Date.now() | 0;
  testInfo.annotations.push({ type: "seed", description: String(seed) });
  const random = mulberry32(seed);

  const claimCells = shuffle(
    Array.from({ length: CELLS_COUNT }, (_, i) => i),
    random,
  ).slice(0, 6);
  const actions: Action[] = claimCells.map((cell) => ({
    kind: "claim",
    peer: random() < 0.5 ? "host" : "guest",
    cell,
  }));
  // A disconnect/rejoin never happens as the very first move (there'd be
  // nothing settled yet to make interesting) — insert it somewhere from
  // the second action onward.
  const rejoinAt = 1 + Math.floor(random() * (actions.length - 1));
  actions.splice(rejoinAt, 0, { kind: "rejoin" });

  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  const guestPage = await guestContext.newPage();

  try {
    await hostPage.goto(APP_URL);
    await openRoomDialog(hostPage);
    const roomCode = await hostRoom(hostPage, "Hosty");

    await guestPage.goto(APP_URL);
    await openRoomDialog(guestPage);
    await joinRoomAs(guestPage, "Guesty", roomCode);
    await expect
      .poll(() => playersListText(hostPage), { timeout: 30_000 })
      .toContain("Guesty");
    await closeRoomDialog(hostPage);
    await closeRoomDialog(guestPage);

    // Re-reads *both* pages on every poll attempt — capturing one side once
    // and polling only the other would freeze a stale snapshot the instant
    // the frozen side hasn't settled yet either (a real risk here: either
    // peer's own claim only reaches its own DOM after the same host
    // round-trip as the other peer's).
    const expectBoardsToConverge = async () => {
      await expect
        .poll(
          async () => {
            const [hostSide, guestSide] = await Promise.all([
              boardColors(hostPage, CELLS_COUNT),
              boardColors(guestPage, CELLS_COUNT),
            ]);
            return JSON.stringify(hostSide) === JSON.stringify(guestSide);
          },
          { timeout: 30_000 },
        )
        .toBe(true);
    };

    for (const action of actions) {
      if (action.kind === "claim") {
        const page = action.peer === "host" ? hostPage : guestPage;
        await boardCell(page, action.cell).click();
        await expectBoardsToConverge();
        continue;
      }

      // Simulate a disconnect/reconnect: the guest leaves the room
      // entirely (a new peer identity on rejoin) and joins straight back
      // in, on the very same page/tab — same as a real flaky-connection
      // recovery, not a full app reload.
      await openRoomDialog(guestPage);
      await guestPage.getByRole("button", { name: "Leave room" }).click();
      await joinRoomAs(guestPage, "Guesty", roomCode);
      // joinRoomAs already waits for the guest's own connected view, which
      // proves it has heard back from the host at least once — good enough
      // to confirm the reconnect landed; the host's dialog is closed at
      // this point so its own players list isn't in the (visible) DOM to
      // poll (a closed native <dialog> is `display: none`).
      await expect(guestPage.getByTestId("room-players-list")).toContainText(
        "Hosty",
      );
      await closeRoomDialog(guestPage);
      await expectBoardsToConverge();
    }

    await expectBoardsToConverge();
  } finally {
    await hostContext.close();
    await guestContext.close();
  }
});
