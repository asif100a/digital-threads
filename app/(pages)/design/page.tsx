"use client";

import { Canvas, Circle, Rect, type FabricObject } from "fabric";
import type { FabricCanvas } from "@/types/fabric-helpers";
import React, { useEffect, useRef, useState } from "react";
import { RiRectangleLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { FaRegCircle } from "react-icons/fa";
import Settings from "@/app/components/Settings";
import Video from "@/app/components/Video";
import CanvasSettings from "@/app/components/CanvasSettings";

import type { Guideline } from "@/app/components/snappingHelper";
import { clearGuideLines, handleObjectMoving } from "@/app/components/snappingHelper";

export default function Design() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);

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
        handleObjectMoving(initCanvas, event.target, guidelines as any, setGuidelines)
      );

      initCanvas.on("object:modified", () =>
        clearGuideLines(initCanvas, guidelines as any, setGuidelines)
      );

      return () => {
        initCanvas.dispose();
      };
    }
  }, []);

  const addRectangle = () => {
    if (canvas) {
      const rect = new Rect({
        top: 100,
        left: 50,
        width: 100,
        height: 60,
        fill: "#F08080",
      });
      canvas.add(rect);
    }
  };

  const addCircle = () => {
    if (canvas) {
      const circle = new Circle({
        top: 150,
        left: 150,
        radius: 50,
        fill: "#EE82EE",
      });
      canvas.add(circle);
    }
  };

  return (
    <div className="py-16 flex justify-center items-center gap-12">
      <div className="flex flex-col gap-3 relative">
        <Button onClick={addRectangle} className="w-fit mx-auto">
          <RiRectangleLine />
        </Button>

        <Button onClick={addCircle} className="w-fit mx-auto">
          <FaRegCircle />
        </Button>

        <Video canvas={canvas} canvasRef={canvasRef} />
      </div>

      <canvas
        id="canvas"
        ref={canvasRef}
        className="border-2 border-dotted"
      ></canvas>

      <div className="space-y-6">
        <div>
          <Settings canvas={canvas} />
        </div>
        <div>
          <h4 className="text-lg font-medium mb-3">Canvas Settings</h4>
          <CanvasSettings canvas={canvas} />
        </div>
      </div>
    </div>
  );
}