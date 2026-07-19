import { IconRefresh } from "../../libs/icons/Refresh";
import { useConfirmBoardReset } from "../room/useConfirmBoardReset";
import { useSetColorIndices } from "../store/colors/indices";
import { useSeedNumberValue, useSeedNumberReducer } from "../store/seed";

export const SeedInput = () => {
  const seed = useSeedNumberValue();
  const setSeed = useSeedNumberReducer();
  const setColorIndices = useSetColorIndices();
  const confirmBoardReset = useConfirmBoardReset();

  return (
    <div className="join">
      <div>
        <div className="grid items-center justify-items-end">
          <input
            type="number"
            className={`input input-sm join-item col-end-1 row-end-1 transition-[width] ease-out`}
            placeholder="seed? (123456)"
            value={seed}
            onChange={(e) =>
              setSeed({ action: "set", value: e.currentTarget.valueAsNumber })
            }
          />
        </div>
      </div>
      <button
        className="btn join-item btn-primary btn-sm"
        onClick={() => {
          if (!confirmBoardReset()) {
            return;
          }
          setSeed({ action: "randomize" });
          setColorIndices({ action: "clear" });
        }}
      >
        <span className="size-4 fill-current stroke-current">
          <IconRefresh />
        </span>
      </button>
    </div>
  );
};
