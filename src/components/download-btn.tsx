import {
  getNodesBounds,
  getViewportForBounds,
  Panel,
  useReactFlow,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import { useState } from "react";
import { BsDownload } from "react-icons/bs";

function downloadImage(dataUrl: string) {
  const a = document.createElement("a");
  a.setAttribute("download", `flow-board-${Date.now()}.png`);
  a.setAttribute("href", dataUrl);
  a.click();
}

const imageWidth = 1920;
const imageHeight = 768;

function DownloadButton() {
  const [isHovered, setIsHovered] = useState(false);
  const { getNodes } = useReactFlow();
  const onClick = () => {
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library
    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      1,
      5,
      1
    );

    const viewportEl = document.querySelector(
      ".react-flow__viewport"
    ) as HTMLElement | null;
    if (!viewportEl) return;
    toPng(viewportEl, {
      backgroundColor: "",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then(downloadImage);
  };

  return (
    <Panel position="top-right">
      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center text-white  py-2 px-3 bg-white/10 cursor-pointer rounded-xl rounded-s-none group hover:bg-white/20 transition-all duration-300"
        onClick={onClick}
      >
        <BsDownload className="size-6  hover:text-blue-500 cursor-pointer" />
        <span
          className={`absolute right-full  bg-white/20 backdrop-blur-xl rounded-s-2xl   py-2 px-4 transition-all duration-300 text-nowrap transform ${
            isHovered
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4 pointer-events-none"
          }`}
        >
          Download As Png
        </span>
      </button>
    </Panel>
  );
}

export default DownloadButton;
