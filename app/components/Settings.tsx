
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { BorderTrail } from "@/components/motion-primitives/border-trail";
import type { Canvas as FabricCanvas, Rect as FabricRect, Circle as FabricCircle } from "fabric";


type SettingsProps = {
  canvas: typeof FabricCanvas | null;
};

type FabricObjectType = (typeof FabricRect | typeof FabricCircle) & {
  type: string;
  set: (props: any) => void;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  fill?: string;
  radius?: number;
};

export default function Settings({ canvas }: SettingsProps) {
  const [selectedObject, setSelectedObject] = useState<FabricObjectType | null>(null);
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [diameter, setDiameter] = useState<string>("");
  const [color, setColor] = useState<string>("");

  useEffect(() => {
    // console.log("Canvas prop received:", canvas); // Debug canvas prop
    if (canvas) {
  const handleSelectionCreated = (event: { selected?: FabricObjectType[] }) => {
        // console.log("Selection created:", event.selected); // Debug
        handleObjectSelection(event.selected?.[0]);
      };

  const handleSelectionUpdated = (event: { selected?: FabricObjectType[] }) => {
        // console.log("Selection updated:", event.selected); // Debug
        handleObjectSelection(event.selected?.[0]);
      };

      const handleSelectionCleared = () => {
        // console.log("Selection cleared"); // Debug
        setSelectedObject(null);
        clearSettings();
      };

  const handleObjectModified = (event: { target?: FabricObjectType }) => {
        // console.log("Object modified:", event.target); // Debug
        handleObjectSelection(event.target);
      };

  const handleObjectScaling = (event: { target?: FabricObjectType }) => {
        // console.log("Object scaling:", event.target); // Debug
        handleObjectSelection(event.target);
      };

      canvas.on("selection:created", handleSelectionCreated);
      canvas.on("selection:updated", handleSelectionUpdated);
      canvas.on("selection:cleared", handleSelectionCleared);
      canvas.on("object:modified", handleObjectModified);
      canvas.on("object:scaling", handleObjectScaling);

      return () => {
        canvas.off("selection:created", handleSelectionCreated);
        canvas.off("selection:updated", handleSelectionUpdated);
        canvas.off("selection:cleared", handleSelectionCleared);
        canvas.off("object:modified", handleObjectModified);
        canvas.off("object:scaling", handleObjectScaling);
      };
    }
  }, [canvas]);

  const handleObjectSelection = (object: FabricObjectType | null | undefined) => {
    // console.log("Handling object selection:", object); // Debug
  if (!object || !["rect", "circle"].includes(object.type)) {
      setSelectedObject(null);
      clearSettings();
      return;
    }

    setSelectedObject(object);

    if (object.type === "rect") {
      setWidth(
        object.width && object.scaleX ? String(Math.round(object.width * object.scaleX)) : ""
      );
      setHeight(
        object.height && object.scaleY ? String(Math.round(object.height * object.scaleY)) : ""
      );
      setColor(object.fill || "");
      setDiameter("");
    } else if (object.type === "circle") {
      setDiameter(
        object.radius && object.scaleX ? String(Math.round(object.radius * 2 * object.scaleX)) : ""
      );
      setColor(object.fill || "");
      setWidth("");
      setHeight("");
    }
  };

  const clearSettings = () => {
    setWidth("");
    setHeight("");
    setColor("");
    setDiameter("");
  };

  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/,/g, "");
    const intValue = parseInt(value, 10);
    setWidth(value);
    if (selectedObject && selectedObject.type === "rect" && !isNaN(intValue) && intValue >= 0) {
      selectedObject.set({ width: intValue, scaleX: 1 });
      canvas?.renderAll();
    }
  };

  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/,/g, "");
    const intValue = parseInt(value, 10);
    setHeight(value);
    if (selectedObject && selectedObject.type === "rect" && !isNaN(intValue) && intValue >= 0) {
      selectedObject.set({ height: intValue, scaleY: 1 });
      canvas?.renderAll();
    }
  };

  const handleDiameterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/,/g, "");
    const intValue = parseInt(value, 10);
    setDiameter(value);
    if (selectedObject && selectedObject.type === "circle" && !isNaN(intValue) && intValue >= 0) {
      selectedObject.set({ radius: intValue / 2, scaleX: 1, scaleY: 1 });
      canvas?.renderAll();
    }
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setColor(value);
    if (selectedObject) {
      selectedObject.set({ fill: value });
      canvas?.renderAll();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* <div>Test: Settings Component Rendered</div> Debug rendering
      {console.log("Selected object in render:", selectedObject)} Debug */}
      {selectedObject && selectedObject.type === "rect" && (
        <>
          <div>
            <Label>Width</Label>
            <BorderTrailInput onChange={handleWidthChange} value={width} />
          </div>
          <div>
            <Label>Height</Label>
            <BorderTrailInput onChange={handleHeightChange} value={height} />
          </div>
          <div>
            <Label>Color</Label>
            <Input type="color" onChange={handleColorChange} value={color} />
          </div>
        </>
      )}
      {selectedObject && selectedObject.type === "circle" && (
        <>
          <div>
            <Label>Diameter</Label>
            <BorderTrailInput onChange={handleDiameterChange} value={diameter} />
          </div>
          <div>
            <Label>Color</Label>
            <Input type="color" onChange={handleColorChange} value={color} />
          </div>
        </>
      )}
    </div>
  );
}

// import { BorderTrail } from "@/components/motion-primitives/border-trail";

type BorderTrailInputProps = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
};

export function BorderTrailInput({ onChange, value }: BorderTrailInputProps) {
  return (
    <div className="relative h-full w-[260px] overflow-hidden rounded-md border border-zinc-950/10 bg-white text-zinc-700 outline-hidden dark:border-zinc-50/20 dark:bg-zinc-950 dark:text-zinc-300">
      <Input
        onChange={onChange}
        value={value}
        className="h-full w-full resize-none rounded-md bg-transparent px-4 py-3 text-sm outline-hidden"
      />
      <BorderTrail
        className="bg-linear-to-l from-blue-200 via-blue-500 to-blue-200 dark:from-blue-400 dark:via-blue-500 dark:to-blue-700"
        size={120}
      />
    </div>
  );
}
