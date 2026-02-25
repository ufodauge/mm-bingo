import { atomWithStorage } from 'jotai/utils';

export const boardContainerSizeAtom = atomWithStorage<number>(
  'ufodauge/mm-bingo/board-container-size',
  60,
  undefined,
  { getOnInit: true }
);
