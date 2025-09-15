import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import type {Canvas as FabricCanvas} from 'fabric'

type CanvasSettingsProps = {
    canvas: typeof FabricCanvas | null;
};

export default function CanvasSettings({ canvas }: CanvasSettingsProps) {
  const [canvasHeight, setCanvasHeight] = useState(500);
  const [canvasWidth, setCanvasWidth] = useState(500);

  useEffect(() => {
    if (canvas) {
      canvas.setWidth(canvasWidth);
      canvas.setHeight(canvasHeight);
      canvas.renderAll();
    }
  }, [canvasWidth, canvasHeight, canvas]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    const intValue = parseInt(value);
    if (intValue > 0) setCanvasWidth(intValue);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    const intValue = parseInt(value);
    if (intValue > 0) setCanvasHeight(intValue);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label>Width:</Label>
        <Input type="number" value={canvasWidth} onChange={handleWidthChange} className="ml-1" />
      </div>
      <div className="flex items-center gap-2">
        <Label>Height:</Label>
        <Input type="number" value={canvasHeight} onChange={handleHeightChange} />
      </div>
    </div>
  );
}
