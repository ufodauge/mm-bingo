import { atom } from "jotai";

import { getCurrentQueryParams } from "../../libs/getCurrentQueryParams";
import { defaultGameStatus, type GameStatus } from "./schemas";

const queryParamsPrimitiveAtom = atom<GameStatus>();
export const queryParamsAtom = atom(
  (get) => {
    const primitive = get(queryParamsPrimitiveAtom);
    const queryParams = getCurrentQueryParams();
    const rawSeed = queryParams.get("seed");
    const rawVersion = queryParams.get("version");

    if (rawSeed === null) {
      return primitive ?? defaultGameStatus;
    }

    const parsedSeed = Number.parseInt(rawSeed);
    return {
      seed: Number.isFinite(parsedSeed) ? parsedSeed : defaultGameStatus.seed,
      version: rawVersion ?? defaultGameStatus.version,
    };
  },
  (_get, set, gameStatus: GameStatus) => {
    const queryParams = getCurrentQueryParams();
    for (const key in gameStatus) {
      if (key === "seed") {
        queryParams.set(key, gameStatus[key].toString());
      } else if (key === "version") {
        queryParams.set(key, gameStatus[key].toString());
      }
    }
    const paramsStr = [...queryParams.entries()]
      .map((v) => v.join("="))
      .join("&");

    history.replaceState(
      history.state,
      "",
      `${document.location.pathname}?${paramsStr}`,
    );
    set(queryParamsPrimitiveAtom, gameStatus);
  },
);
