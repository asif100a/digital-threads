import { Button } from "@/components/ui/button";
import { Rect, Canvas } from "fabric";
import { IoMdCrop } from "react-icons/io";
import { v4 as uuidv4 } from "uuid";

interface CroppingProps {
  canvas: typeof Canvas | null;
  onFramesUpdated: () => void;
}

export default function Cropping({ canvas, onFramesUpdated }: CroppingProps) {
  const addFrameToCanvas = () => {
    if (!canvas) return;

    const frameName = `Frame_${uuidv4()}`;
    const frame = new Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 200,
      fill: "transparent",
      stroke: "#07FE3D",
      strokeWidth: 1,
      selectable: true,
      evented: true,
      name: frameName,
    });

    canvas.add(frame);
    canvas.renderAll();

    const maintainStrokeWidth = (object: typeof frame) => {
      const scaleX = object.scaleX || 1;
      const scaleY = object.scaleY || 1;

      object.set({
        width: object.width * scaleX,
        height: object.height * scaleY,
        scaleX: 1,
        scaleY: 1,
        strokeWidth: 1,
      });

      object.setCoords();
    };

    frame.on("scaling", () => {
      maintainStrokeWidth(frame);
      canvas.renderAll();
    });

    frame.on("modified", () => {
      maintainStrokeWidth(frame);
      canvas.renderAll();
    });

    onFramesUpdated();
  };

  return (
    <div className="text-center">
      <Button
        onClick={addFrameToCanvas}
        className="w-fit mx-auto"
        aria-label="Add Crop Frame"
        disabled={!canvas}
      >
        <IoMdCrop />
      </Button>
    </div>
  );
}