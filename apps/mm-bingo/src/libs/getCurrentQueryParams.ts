export const getCurrentQueryParams = () => new URL(decodeURIComponent(document.location.href)).searchParams;
