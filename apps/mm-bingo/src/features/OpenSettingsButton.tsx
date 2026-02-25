import { useRef } from "react";
import { createPortal } from "react-dom";
import { IconSettings } from "../libs/icons/Settings";
import { SettingsForm } from "./SettingsForm";

export const OpenSettingsButton = ({ className }: { className?: string }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className={`btn btn-primary btn-sm btn-circle ${className}`}
      >
        <span className="size-4 fill-current">
          <IconSettings />
        </span>
      </button>
      {createPortal(
        <dialog ref={dialogRef} className="modal">
          <div className="modal-box bg-base-100/90 backdrop-blur-lg">
            <SettingsForm />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>,
        document.body,
      )}
    </>
  );
};
