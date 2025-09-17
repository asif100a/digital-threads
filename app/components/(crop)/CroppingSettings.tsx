import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Canvas, FabricObject } from "fabric";
import { debounce } from "lodash";

interface CroppingSettingsProps {
  canvas: typeof Canvas | null;
  refreshKey: number;
}

interface CustomFabricObject extends FabricObject {
  name?: string;
}

export default function CroppingSettings({ canvas, refreshKey }: CroppingSettingsProps) {
  const [frames, setFrames] = useState<CustomFabricObject[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<CustomFabricObject | null>(null);

  const updateFrame = () => {
    if (!canvas) return;

    const framesFromCanvas = canvas.getObjects("rect").filter((obj: any) => {
      return obj.name && obj.name.startsWith("Frame");
    });

    setFrames(framesFromCanvas);

    if (framesFromCanvas.length > 0 && !selectedFrame) {
      setSelectedFrame(framesFromCanvas[0]);
      canvas.setActiveObject(framesFromCanvas[0]);
      canvas.renderAll();
    }
  };

  const debouncedUpdateFrame = debounce(updateFrame, 100);

  useEffect(() => {
    debouncedUpdateFrame();
    return () => debouncedUpdateFrame.cancel();
  }, [canvas, refreshKey]);

  const handleFrameSelect = (value: string) => {
    if (!canvas) return;
    const selected = frames.find((frame: any) => frame.name === value);
    if (selected) {
      setSelectedFrame(selected);
      canvas.setActiveObject(selected);
      canvas.renderAll();
    }
  };

  const exportFrameAsPNG = () => {
    if (!selectedFrame || !canvas) return;

    frames.forEach((frame) => frame.set("visible", false));
    selectedFrame.set({ strokeWidth: 0, visible: true });

    try {
      const dataURL = canvas.toDataURL({
        left: selectedFrame.left,
        top: selectedFrame.top,
        width: selectedFrame.width * (selectedFrame.scaleX || 1),
        height: selectedFrame.height * (selectedFrame.scaleY || 1),
        format: "png",
      });

      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `${selectedFrame.name}.png`;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      selectedFrame.set({ strokeWidth: 1 });
      frames.forEach((frame) => frame.set("visible", true));
      canvas.renderAll();
    }
  };

  return (
    <div>
      {frames.length > 0 && (
        <>
          <Select onValueChange={handleFrameSelect}>
            <SelectTrigger className="w-[180px]" aria-label="Select a frame">
              <SelectValue placeholder="Select a frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Frames</SelectLabel>
                {frames.map((frame: any) => (
                  <SelectItem key={frame.name} value={frame.name}>
                    {frame.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            onClick={exportFrameAsPNG}
            className="mt-2"
            aria-label="Export selected frame as PNG"
            disabled={!selectedFrame}
          >
            <Download className="mr-2 h-4 w-4" /> Export As PNG
          </Button>
        </>
      )}
    </div>
  );
}