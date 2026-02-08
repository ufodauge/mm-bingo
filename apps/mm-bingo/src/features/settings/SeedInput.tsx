import { IconRefresh } from '../../libs/icons/Refresh';
import { useSetColorIndices } from '../store/colors/indices';
import { useSeedNumberValue, useSeedNumberReducer } from '../store/seed';

export const SeedInput = () => {
  const seed = useSeedNumberValue();
  const setSeed = useSeedNumberReducer();
  const setColorIndices = useSetColorIndices();

  return (
    <div className="join">
      <div>
        <div className="grid justify-items-end items-center">
          <input
            type="number"
            className={`input input-sm join-item row-end-1 col-end-1 transition-[width] ease-out`}
            placeholder="seed? (123456)"
            value={seed}
            onChange={(e) =>
              setSeed({ action: 'set', value: e.currentTarget.valueAsNumber })
            }
          />
        </div>
      </div>
      <button
        className="btn join-item btn-primary btn-sm"
        onClick={() => {
          setSeed({ action: 'randomize' });
          setColorIndices({ action: 'clear' });
        }}
      >
        <span className="fill-current stroke-current size-4">
          <IconRefresh />
        </span>
      </button>
    </div>
  );
};
