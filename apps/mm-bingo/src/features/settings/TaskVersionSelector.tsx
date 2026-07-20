import { useAtom } from "jotai";

import { useConfirmBoardReset } from "../room/useConfirmBoardReset";
import { useSetColorIndices } from "../store/colors/indices";
import { taskVersionAtom } from "../store/taskVersion";
import {
  isTaskVersion,
  latestTaskVersion,
  taskVersions,
  type TaskVersion,
} from "../store/versions/taskVersion";

export const TaskVersionSelector = () => {
  const [versionRaw, setVersion] = useAtom(taskVersionAtom);
  const version = isTaskVersion(versionRaw.toString())
    ? versionRaw.toString()
    : latestTaskVersion;
  const setColorIndices = useSetColorIndices();
  const confirmBoardReset = useConfirmBoardReset();

  return (
    <select
      className="select"
      value={version}
      onChange={(e) => {
        if (!confirmBoardReset()) {
          return;
        }
        setVersion(e.currentTarget.value as TaskVersion);
        setColorIndices({ action: "clear" });
      }}
    >
      {taskVersions.map((v) => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
    </select>
  );
};
