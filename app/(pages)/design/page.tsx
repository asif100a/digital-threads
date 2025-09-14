"use client";

import { Canvas, Circle, Rect } from "fabric";
import React, { useEffect, useRef, useState } from "react";
import { RiRectangleLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { FaRegCircle } from "react-icons/fa";
import Settings from "@/app/components/Settings";
import Video from "@/app/components/Video";

export default function Design() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);

  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new Canvas(canvasRef.current, {
        width: 500,
        height: 600,
      });

      initCanvas.backgroundColor = "#fff";
      initCanvas.renderAll();

      setCanvas(initCanvas);

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
        <Button onClick={addRectangle}>
          <RiRectangleLine />
        </Button>

        <Button onClick={addCircle}>
          <FaRegCircle />
        </Button>

        <Video canvas={canvas} canvasRef={canvasRef} />
      </div>

      <canvas
        id="canvas"
        ref={canvasRef}
        className="border-2 border-dotted"
      ></canvas>
      <div className="absolute top-2/5 right-[356px]">
        <Settings canvas={canvas} />
      </div>
    </div>
  );
}
