// Which proto a browser tab is, at a glance (Peter, 2026-11-04):
// - the favicon is the lemlist mark: blue on the deployed proto, yellow on a
//   local dev server (localhost, 127.0.0.1, a LAN address);
// - the tab title starts with the proto's name, then "local" on a dev server,
//   then the page's own title, or "lemlist": "Account-based · lemlist",
//   "Account-based · local", "Account-based · local · Cold Email - Tech Startups".
//
// A new proto only gives its name, in index.html:
//   <meta name="proto-name" content="Account-based" />
// (and the same name in the static <title>, shown before the app loads).
// Same file in the account-based proto (~/vibecode/protos/account-based).

const LOCAL_HOSTNAME = /^(localhost|127(\.\d{1,3}){3}|0\.0\.0\.0|\[?::1\]?)$|\.localhost$|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./;

export const isLocalProto = (): boolean => LOCAL_HOSTNAME.test(window.location.hostname);

export const protoName = (): string =>
  document.querySelector<HTMLMetaElement>('meta[name="proto-name"]')?.content.trim() || "lemlist proto";

/** The tab title: the proto's name first, "local" on a dev server, then the page (or "lemlist"). */
export function protoTitle(page?: string): string {
  const local = isLocalProto();
  const parts = [protoName()];
  if (local) parts.push("local");
  if (page) parts.push(page);
  else if (!local) parts.push("lemlist");
  return parts.join(" · ");
}

// The lemlist mark (lemlist.svg of the integrations logos in account-based):
// a rounded square and three bars. Brand artwork, not UI tokens.
const SQUARE =
  "M34.5211 0.5H7.4789C3.34842 0.5 0 3.84841 0 7.9789V35.0211C0 39.1516 3.34842 42.5 7.4789 42.5H34.5211C38.6516 42.5 42 39.1516 42 35.0211V7.9789C42 3.84841 38.6516 0.5 34.5211 0.5Z";
const MARK = [
  "M30.7498 28.6023V30.1475C30.7498 30.756 30.2559 31.2499 29.6474 31.2499H15.568C13.2503 31.1017 11.3982 29.2497 11.25 26.9319V12.8525C11.25 12.244 11.7439 11.7501 12.3524 11.7501H13.8976C14.5061 11.7501 15 12.244 15 12.8525V24.6335C15 26.2175 16.2824 27.4999 17.8664 27.4999H29.6474C30.2559 27.4999 30.7498 27.9938 30.7498 28.6023Z",
  "M29.6473 11.7501H19.8524C19.2436 11.7501 18.75 12.2437 18.75 12.8525V14.3977C18.75 15.0065 19.2436 15.5001 19.8524 15.5001H29.6473C30.2562 15.5001 30.7497 15.0065 30.7497 14.3977V12.8525C30.7497 12.2437 30.2562 11.7501 29.6473 11.7501Z",
  "M27.8975 19.6259H19.8524C19.2436 19.6259 18.75 20.1194 18.75 20.7283V22.2735C18.75 22.8823 19.2436 23.3759 19.8524 23.3759H27.8975C28.5064 23.3759 29 22.8823 29 22.2735V20.7283C29 20.1194 28.5064 19.6259 27.8975 19.6259Z",
];

/** Deployed: lemlist blue, white mark. Local: yellow, near-black mark (white doesn't read on yellow). */
const COLORS = {
  deployed: { square: "#316BFF", mark: "#FFFFFF" },
  local: { square: "#FFC700", mark: "#1A1C27" },
};

function faviconHref(local: boolean): string {
  const { square, mark } = local ? COLORS.local : COLORS.deployed;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 43"><path d="${SQUARE}" fill="${square}"/>${MARK.map((d) => `<path d="${d}" fill="${mark}"/>`).join("")}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Sets the favicon and the tab title. Call once, before the app renders. */
export function installProtoIdentity(): void {
  const local = isLocalProto();
  document.title = protoTitle();
  let icon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
  if (!icon) {
    icon = document.createElement("link");
    icon.rel = "icon";
    document.head.appendChild(icon);
  }
  icon.type = "image/svg+xml";
  icon.href = faviconHref(local);
}
