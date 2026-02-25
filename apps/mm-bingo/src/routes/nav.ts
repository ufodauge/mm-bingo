type NavLinkTarget = "index" | "popup";

const getNavLink = (target: NavLinkTarget): URL => {
  return new URL(
    `${window.location.origin}/${import.meta.env.DEV ? "" : "mm-bingo/"}${target}`,
  );
};

export const nav = {
  getNavLink,
};
