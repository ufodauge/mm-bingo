import { StrictMode } from "react";
import "./index.css";
import { App } from "../pages/App";
import { router } from "./router";

router(
  <StrictMode>
    <App />
  </StrictMode>,
);
