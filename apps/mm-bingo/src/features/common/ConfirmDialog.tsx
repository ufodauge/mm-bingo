import type { PropsWithChildren, ReactNode } from 'react';

type Props<T extends string> = {
  selective: [ReactNode, T][];
  onConfirmed: (result: T) => void;
};

export const ConfirmDialog = <T extends string = 'ok' | 'cancel'>({
  children,
  onConfirmed,
  selective,
}: PropsWithChildren<Props<T>>) => {
  return (
    <dialog className="modal">
      <div className="modal-box">
        {children}
        <div className="modal-action">
          {selective.map(([node, value]) => (
            <form method="dialog" className="modal-backdrop">
              <button
                onClick={() => {
                  onConfirmed(value);
                }}
              >
                {node}
              </button>
            </form>
          ))}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};
