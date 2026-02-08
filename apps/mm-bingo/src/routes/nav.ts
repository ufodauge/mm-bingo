type NavLinkTarget = "index" | "popup";

const getNavLink = (target: NavLinkTarget): URL => {
  return new URL(`${window.location.origin}/${target}`);
};

export const nav = {
  getNavLink,
};
