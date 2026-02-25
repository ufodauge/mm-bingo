import { atom } from "jotai";
import { getCurrentQueryParams } from "../../libs/getCurrentQueryParams";
import { defaultGameStatus, type GameStatus } from "./schemas";

const queryParamsPrimitiveAtom = atom<GameStatus>();
export const queryParamsAtom = atom(
  (get) => {
    const primitive = get(queryParamsPrimitiveAtom);
    const queryParams = getCurrentQueryParams();
    const raw = queryParams.get("seed");

    if (raw === null) {
      return primitive ?? defaultGameStatus;
    }

    return {
      seed: Number.parseInt(raw),
    };
  },
  (_get, set, gameStatus: GameStatus) => {
    const queryParams = getCurrentQueryParams();
    for (const key in gameStatus) {
      if (key === "seed") {
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
