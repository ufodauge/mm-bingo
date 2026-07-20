import type { Page } from "@playwright/test";

// Every test forces English via i18next's built-in `?lng=` query-string
// detection (see src/i18n/index.ts) so button/label text is stable
// regardless of the machine's locale.
export const APP_URL = "/?lng=en";

export const openRoomDialog = async (page: Page): Promise<void> => {
  await page.getByTestId("room-toggle-button").click();
};

// Creates a room from a fresh page (dialog must already be open) and leaves
// the dialog open on the connected view, badge-checked as "Host".
export const hostRoom = async (page: Page, name: string): Promise<string> => {
  await page.getByTestId("room-role-host-button").click();
  await page.getByPlaceholder("Your name").fill(name);
  await page.getByRole("button", { name: "Host a room" }).click();
  await page.getByTestId("room-role-badge").waitFor({ state: "visible" });
  return page.getByTestId("room-code-display").inputValue();
};

// Joins an existing room from a fresh page (dialog must already be open).
export const joinRoomAs = async (
  page: Page,
  name: string,
  roomCode: string,
): Promise<void> => {
  await page.getByTestId("room-role-guest-button").click();
  await page.getByPlaceholder("Your name").fill(name);
  await page.getByTestId("room-code-input").fill(roomCode);
  await page.getByRole("button", { name: "Join a room" }).click();
  await page.getByTestId("room-role-badge").waitFor({ state: "visible" });
};

// The dialog's <dialog> element covers the board while open — close it
// (native <dialog> closes on Escape) before interacting with cells.
export const closeRoomDialog = async (page: Page): Promise<void> => {
  await page.keyboard.press("Escape");
};

export const playersListText = (page: Page) =>
  page.getByTestId("room-players-list").innerText();

export const boardCell = (page: Page, index: number) =>
  page.getByTestId(`board-cell-${index}`);

export const cellColor = (page: Page, index: number): Promise<string> =>
  boardCell(page, index).evaluate((el) => getComputedStyle(el).backgroundColor);

// Every cell's current background color, in index order — a full snapshot
// of what's visually claimed, used to compare two peers' boards for exact
// agreement after a sequence of claims.
export const boardColors = (page: Page, cellCount: number): Promise<string[]> =>
  page.evaluate((count) => {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      const el = document.querySelector(`[data-testid="board-cell-${i}"]`);
      colors.push(el ? getComputedStyle(el).backgroundColor : "");
    }
    return colors;
  }, cellCount);

// A small seeded PRNG (mulberry32) so a randomized test's exact action
// order can be reproduced from the seed logged on failure, without pinning
// the suite to one fixed order forever.
export const mulberry32 = (seed: number): (() => number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const shuffle = <T>(items: T[], random: () => number): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
