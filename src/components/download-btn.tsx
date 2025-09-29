import {
  getNodesBounds,
  getViewportForBounds,
  Panel,
  useReactFlow,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import { useState } from "react";
import { BsDownload } from "react-icons/bs";
import { ToolTip } from "./tooltip";

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
        className="text-white z-50 -translate-x-8"
        onClick={onClick}
      >
        <ToolTip text="Save As Png">
          <BsDownload className="size-6  hover:text-blue-500 cursor-pointer" />
        </ToolTip>
      </button>
    </Panel>
  );
}

export default DownloadButton;
