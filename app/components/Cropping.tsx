import { Button } from "@/components/ui/button";
import { Rect, Canvas } from "fabric";
import { IoMdCrop } from "react-icons/io";

function Cropping({ canvas, onFramesUpdated }: typeof Canvas) {
  const addFrameToCanvas = () => {
    const frameName = `Frame ${canvas.getObjects("rect").length + 1}`;

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

    const maintainStrokeWidth = (object) => {
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
    <div>
      <Button onClick={addFrameToCanvas}>
        <IoMdCrop />
      </Button>
    </div>
  );
}
