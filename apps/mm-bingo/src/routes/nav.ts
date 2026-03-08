type NavLinkTarget = "index" | "popup-card" | "popup-row";

const getNavLink = (target: NavLinkTarget): URL => {
  return new URL(
    `${window.location.origin}/${import.meta.env.DEV ? "" : "mm-bingo/"}${target}`,
  );
};

export const nav = {
  getNavLink,
};
