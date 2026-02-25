import { atomWithStorage } from 'jotai/utils';

export const boardContainerSizeAtom = atomWithStorage<number>(
  'board:board-container-size',
  60,
  undefined,
  { getOnInit: true }
);
