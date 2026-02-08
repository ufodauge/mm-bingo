import { IconCheck } from "../../../libs/icons/Check";
import { IconCircle } from "../../../libs/icons/Circle";

const TogglerButton = ({ icon }: { icon: string }) => {
  return (
    <label
      className="swap swap-rotate place-items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <input type="checkbox" className="peer" />
      <img
        src={!icon ? "/button.png" : icon}
        alt="icon"
        className="size-8 transition-[size] peer-checked:size-6 peer-checked:grayscale"
      />
      <span className="swap-on z-1 size-8 fill-gray-500/50 backdrop-blur-[1px]">
        <IconCircle />
      </span>
      <span className="swap-on fill-accent z-1 size-8">
        <IconCheck />
      </span>
    </label>
  );
};

type Props = {
  icons: string[];
};

export const Toggler = ({ icons }: Props) => {
  return (
    <div className="grid grid-flow-col-dense gap-2">
      {icons.map((icon, i) => (
        <TogglerButton icon={icon} key={i} />
      ))}
    </div>
  );
};
