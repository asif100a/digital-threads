import { Button } from "@/components/ui/button";
import { Canvas, Circle, Rect, Textbox } from "fabric";
import React from "react";
import { FaRegCircle } from "react-icons/fa";
import { RiRectangleLine } from "react-icons/ri";
import { CiText } from "react-icons/ci";

export default function AddElements({ canvas }: { canvas: typeof Canvas }) {
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

  const addText = () => {
    if (canvas) {
      const textbox = new Textbox("My text", {
        top: 150,
        left: 150,
        width: 200,
        fontSize: 20,
        fill: "#000",
        lockScalingFlip: true,
        lockScalingX: false,
        lockScalingY: false,
        editable: true,
        fontFamily: "OpenSans",
        textAlign: "left",
      });

      canvas.add(textbox);
    }
  };
  return (
    <div>
      <div className="flex flex-col gap-3 relative">
        <Button onClick={addRectangle} className="w-fit mx-auto">
          <RiRectangleLine />
        </Button>

        <Button onClick={addCircle} className="w-fit mx-auto">
          <FaRegCircle />
        </Button>

        <Button onClick={addText} className="w-fit mx-auto">
          <CiText />
        </Button>
      </div>
    </div>
  );
}
