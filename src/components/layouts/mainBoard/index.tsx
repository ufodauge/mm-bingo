import DashBoard from "@/components/features/dashboard";
import Description from "@/components/features/description";
import { container } from "./index.css";
import { memo } from "react";

const MainBoard = memo(function MainBoard() {
  return (
    <div className={container}>
      <DashBoard />
      <Description />
    </div>
  );
});

export default MainBoard;
