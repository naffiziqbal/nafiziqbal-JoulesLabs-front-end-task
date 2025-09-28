import { useState } from "react";
import MainScreen from "./components/main-screen";
import RightBar from "./components/right-bar";
import SideBar from "./components/side-bar";
import type { Node } from "@xyflow/react";

export default function App() {
  const [selected, setSelected] = useState<Node | null>(null);

  return (
    <div className="grid grid-cols-[20%_60%_20%]">
      <SideBar />
      <MainScreen setSelected={setSelected} />
      <RightBar selected={selected} />
    </div>
  );
}
