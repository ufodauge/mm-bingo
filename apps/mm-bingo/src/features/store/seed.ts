import { atom, useAtomValue } from 'jotai';
import { queryParamsAtom } from './queryParams';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';

const boundSeedNumber = (value: number) => Math.max(value, 0);

export const getRandomSeedNumber = () =>
  boundSeedNumber(Math.trunc(Math.random() * 1000000));

export const seedNumberAtom = atom(
  (get) => get(queryParamsAtom).seed,
  (get, set, seed: number) => {
    const status = structuredClone(get(queryParamsAtom));
    status.seed = seed;
    set(queryParamsAtom, status);
  }
);

export const useSeedNumberValue = () => useAtomValue(seedNumberAtom);
type SeedNumberAction =
  | {
      action: 'randomize';
    }
  | {
      action: 'set';
      value: number;
    };

export const useSeedNumberReducer = () =>
  useAtomCallback(
    useCallback((_, set, action: SeedNumberAction) => {
      if (action.action === 'randomize') {
        set(seedNumberAtom, getRandomSeedNumber());
      } else if (action.action === 'set') {
        set(seedNumberAtom, boundSeedNumber(action.value));
      }
    }, [])
  );
