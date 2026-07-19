import type { Tracker } from "../../../libs/tracker/tracker";
import { Counter } from "./tracker/Counter";
import { HeartPieces } from "./tracker/HeartPieces";
import { Toggler } from "./tracker/Toggler";

type Props = {
  trackers: Tracker[];
  textColor: string | undefined;
};

export const CellTrackers = ({ trackers, textColor }: Props) => (
  <>
    {trackers.map((v, i) => {
      switch (v.type) {
        case "counter": {
          const { max, icon, init } = v.properties;
          return (
            <div className="grid justify-center" key={i}>
              <Counter
                init={init}
                max={max}
                icon={icon}
                textColor={textColor}
              />
            </div>
          );
        }

        case "toggler": {
          const { icons } = v.properties;
          return (
            <div className="grid justify-center" key={i}>
              <Toggler icons={icons ?? []} />
            </div>
          );
        }

        case "heart-piece": {
          const { max, init } = v.properties;
          return (
            <div className="grid justify-center" key={i}>
              <HeartPieces max={max} init={init} textColor={textColor} />
            </div>
          );
        }

        default: {
          v satisfies never;
          return <></>;
        }
      }
    })}
  </>
);
