import { expect, test, type Page } from "@playwright/test";

import {
  APP_URL,
  boardCell,
  cellColor,
  closeRoomDialog,
  hostRoom,
  joinRoomAs,
  openRoomDialog,
  playersListText,
} from "./helpers";

// Claiming a cell only updates the *claimer's own* DOM once the round trip
// through the host (guest -> peerToHost -> host -> stateSync -> everyone,
// see RoomSession) completes — even for the host itself, since it goes
// through the very same emitState()/onStateChange path. So "click, then
// immediately read this page's own color" is not safe on either side;
// both directions have to poll for the claim to land before comparing.
//
// The cell's background-color also transitions (daisyUI's .btn styling),
// so a color read the instant it starts changing can catch an
// interpolated oklab() frame instead of the final team color — poll until
// two reads in a row agree, not just until the first read differs from the
// pre-claim baseline.
const claimAndAwaitSettled = async (
  clickerPage: Page,
  cellIndex: number,
): Promise<string> => {
  const before = await cellColor(clickerPage, cellIndex);
  await boardCell(clickerPage, cellIndex).click();
  let previous: string | null = null;
  await expect
    .poll(
      async () => {
        const current = await cellColor(clickerPage, cellIndex);
        const stable = current === previous && current !== before;
        previous = current;
        return stable;
      },
      { timeout: 30_000 },
    )
    .toBe(true);
  return cellColor(clickerPage, cellIndex);
};

// A real black-box test of the multiplayer room: two independent browser
// contexts (separate storage, like two different people) actually
// negotiate WebRTC over Trystero's public Nostr relays — see
// playwright.config.ts and trysteroConfig.ts. No mocking, so this also
// exercises the real network path the RoomSession unit tests (mocked
// trystero) intentionally don't.
test("a host and a guest can find each other and see the same claims", async ({
  browser,
}) => {
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  const guestPage = await guestContext.newPage();

  try {
    await hostPage.goto(APP_URL);
    await openRoomDialog(hostPage);
    const roomCode = await hostRoom(hostPage, "Hosty");
    await expect(hostPage.getByTestId("room-role-badge")).toHaveText("Host");

    await guestPage.goto(APP_URL);
    await openRoomDialog(guestPage);
    await joinRoomAs(guestPage, "Guesty", roomCode);
    await expect(guestPage.getByTestId("room-role-badge")).toHaveText("Guest");

    // Both sides converge on the same two-player roster, each correctly
    // seeing themselves as "You" and the other as "Host"/plain guest.
    await expect
      .poll(() => playersListText(hostPage), { timeout: 30_000 })
      .toContain("Guesty");
    const hostSideRoster = await playersListText(hostPage);
    expect(hostSideRoster).toContain("Hosty (You) (Host)");
    expect(hostSideRoster).toContain("Guesty");
    expect(hostSideRoster).not.toContain("Guesty (You)");

    const guestSideRoster = await playersListText(guestPage);
    expect(guestSideRoster).toContain("Guesty (You)");
    expect(guestSideRoster).toContain("Hosty");
    expect(guestSideRoster).toContain("(Host)");

    await closeRoomDialog(hostPage);
    await closeRoomDialog(guestPage);

    // The host claims a cell; the guest — on a completely separate machine
    // as far as the app knows — sees it flip to the same color too, over
    // the real data channel.
    const hostCellColor = await claimAndAwaitSettled(hostPage, 0);
    await expect
      .poll(() => cellColor(guestPage, 0), { timeout: 30_000 })
      .toBe(hostCellColor);

    // And the reverse direction: a guest's claim reaches the host.
    const guestCellColor = await claimAndAwaitSettled(guestPage, 1);
    await expect
      .poll(() => cellColor(hostPage, 1), { timeout: 30_000 })
      .toBe(guestCellColor);
  } finally {
    await hostContext.close();
    await guestContext.close();
  }
});
