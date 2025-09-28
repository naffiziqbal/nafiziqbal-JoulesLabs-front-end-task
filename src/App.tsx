import MainScreen from "./components/main-screen";
import RightBar from "./components/right-bar";
import SideBar from "./components/side-bar";

export default function App() {
  return (
    <div className="grid grid-cols-[20%_60%_20%]">
      <SideBar />
      <MainScreen />
      <RightBar />
    </div>
  );
}
