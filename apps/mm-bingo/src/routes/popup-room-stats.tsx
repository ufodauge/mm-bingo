import { StrictMode } from "react";

import "./index.css";
import { RoomStatsPopup } from "../pages/RoomStatsPopup";
import { router } from "./router";

router(
  <StrictMode>
    <RoomStatsPopup />
  </StrictMode>,
);
