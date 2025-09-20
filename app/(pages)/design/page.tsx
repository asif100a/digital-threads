"use client";

import { Canvas, type FabricObject } from "fabric";
import type { FabricCanvas } from "@/types/fabric-helpers";
import React, { useEffect, useRef, useState } from "react";
import Settings from "@/app/components/Settings";
import Video from "@/app/components/Video";
import CanvasSettings from "@/app/components/CanvasSettings";

import type { Guideline } from "@/app/components/snappingHelper";
import {
  clearGuideLines,
  handleObjectMoving,
} from "@/app/components/snappingHelper";
import Cropping from "@/app/components/(crop)/Cropping";
import CroppingSettings from "@/app/components/(crop)/CroppingSettings";
import LayerList from "@/app/components/(layer)/LayerList";
import AddElements from "@/app/components/AddElements";
import StyleEditor from "@/app/components/StyleEditor";
import FileExport from "@/app/components/FileExport";

export default function Design() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new Canvas(canvasRef.current, {
        width: 500,
        height: 600,
      });

      initCanvas.backgroundColor = "#fff";
      initCanvas.renderAll();

      setCanvas(initCanvas);

      // Object Moving Logic
      initCanvas.on("object:moving", (event: { target: FabricObject }) =>
        handleObjectMoving(
          initCanvas,
          event.target,
          guidelines as any,
          setGuidelines
        )
      );

      initCanvas.on("object:modified", () =>
        clearGuideLines(initCanvas, guidelines as any, setGuidelines)
      );

      return () => {
        initCanvas.dispose();
      };
    }
  }, []);

  const handleFramesUpdated = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="py-16 flex justify-center items-center gap-12 relative border">
      <div className="flex flex-col gap-3 relative">
        <AddElements canvas={canvas} />

        <Cropping canvas={canvas} onFramesUpdated={handleFramesUpdated} />
        <Video canvas={canvas} canvasRef={canvasRef} />
      </div>

      <div className="absolute top-0 bg-white px-3 py-1 rounded-md shadow">
        <FileExport canvas={canvas} />
      </div>

      <canvas
        id="canvas"
        ref={canvasRef}
        className="border-2 border-dotted"
      ></canvas>

      <div className="space-y-6 absolute left-[72%] top-0 my-6 p-3 border rounded-md shadow-lg bg-white max-h-[580px] overflow-y-auto">
        <div>
          <Settings canvas={canvas} />
        </div>
        <div>
          <h4 className="text-lg font-medium mb-3">Canvas Settings</h4>
          <CanvasSettings canvas={canvas} />
        </div>
        <div className="">
          <CroppingSettings canvas={canvas} refreshKey={refreshKey} />
        </div>
        <div className="">
          <LayerList canvas={canvas} />
        </div>
        <div className="">
          <StyleEditor canvas={canvas} />
        </div>
      </div>
    </div>
  );
}
