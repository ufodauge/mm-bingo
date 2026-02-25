import { isLineType, type LineType } from "../features/board/lineTypes";
import { PopupBoard } from "../features/board/PopupBoard";
import { OpenSettingsButton } from "../features/OpenSettingsButton";
import { getCurrentQueryParams } from "../libs/getCurrentQueryParams";

const queryParams = getCurrentQueryParams();
const target = (() => {
  const targetRaw = queryParams.get("target");
  if (targetRaw === undefined || !isLineType(targetRaw as never)) {
    queryParams.append("target", "card");
    history.replaceState(
      history.state,
      "",
      `${document.location.pathname}?${queryParams.toString()}`,
    );
    return "card";
  }

  // ???
  return targetRaw as LineType;
})();

export const Popup = () => {
  return (
    <>
      <OpenSettingsButton className="hidden" />
      <PopupBoard target={target} />
    </>
  );
};
