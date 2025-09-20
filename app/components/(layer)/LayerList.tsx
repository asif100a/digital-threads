import { Button } from "@/components/ui/button";
import * as fabric from "fabric";
import React, { useEffect, useState } from "react";
import { FaArrowUp, FaEye, FaEyeSlash } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

// Extend fabric.Object to include custom properties
declare module "fabric" {
  interface Object {
    id?: string;
    zIndex?: number;
    prevOpacity?: number;
  }
}

// Define types for clarity
interface Layer {
  id: string;
  zIndex: number;
  type: string;
  opacity: number;
}

// Define custom interface for selection events
interface FabricSelectionEvent {
  selected?: fabric.Object[];
  deselected?: fabric.Object[];
  target?: fabric.Object;
}

interface LayerListProps {
  canvas: typeof fabric.Canvas | null; // Use fabric.Canvas instance type
}

export default function LayerList({ canvas }: LayerListProps) {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  // Add unique ID to canvas objects
  const addIdToObject = (object: fabric.Object) => {
    if (!object.id) {
      object.id = `${object.type}_${uuidv4()}`;
    }
  };

  // Update zIndex for all objects based on their position in the canvas stack
  fabric.Canvas.prototype.updateZIndices = function () {
    const objects = this.getObjects();
    objects.forEach((obj: any, idx: number) => {
      addIdToObject(obj);
      obj.zIndex = idx;
    });
  };

  // Update the layers state with current canvas objects
  const updateLayers = () => {
    if (!canvas) return;

    canvas.updateZIndices();
    const objects = canvas
      .getObjects()
      .filter(
        (obj: any) =>
          !(
            obj.id?.startsWith("vertical-") || obj.id?.startsWith("horizontal-")
          )
      )
      .map((obj: any) => ({
        id: obj.id!, // Non-null assertion since addIdToObject ensures id exists
        zIndex: obj.zIndex!, // Non-null assertion since updateZIndices sets zIndex
        type: obj.type || "unknown",
        opacity: obj.opacity ?? 1, // Use nullish coalescing for default opacity
      }));

    setLayers([...objects].reverse()); // Reverse to show topmost layer first
  };

  // Handle object selection on the canvas
  const handleObjectSelected = (e: FabricSelectionEvent) => {
    const selectedObject = e.selected?.[0] || null;
    setSelectedLayer(selectedObject ? selectedObject.id! : null);
  };

  // Select a layer by clicking on it in the list
  const selectLayerInCanvas = (layerId: string) => {
    if (!canvas) return;

    const object = canvas.getObjects().find((obj: any) => obj.id === layerId);
    if (object) {
      canvas.setActiveObject(object);
      canvas.renderAll();
      setSelectedLayer(object.id!);
    }
  };

  // Move a layer up or down in the stack
  const moveLayer = (layerId: string, direction: "up" | "down") => {
    if (!canvas) return;

    const object = canvas.getObjects().find((obj: any) => obj.id === layerId);
    if (object) {
      const currentIndex = canvas.getObjects().indexOf(object);
      const newIndex =
        direction === "up"
          ? Math.min(currentIndex + 1, canvas.getObjects().length - 1)
          : Math.max(currentIndex - 1, 0);
      canvas.moveTo(object, newIndex);
      canvas.renderAll();
      updateLayers();
    }
  };

  // Move selected layer up or down
  const moveSelectedLayer = (direction: "up" | "down") => {
    if (!selectedLayer || !canvas) return;

    const objects = canvas.getObjects();
    const object = objects.find((obj: any) => obj.id === selectedLayer);
    if (object) {
      const currentIndex = objects.indexOf(object);
      if (direction === "up" && currentIndex < objects.length - 1) {
        canvas.moveTo(object, currentIndex + 1);
      } else if (direction === "down" && currentIndex > 0) {
        canvas.moveTo(object, currentIndex - 1);
      }
      canvas.renderAll();
      updateLayers();
      canvas.setActiveObject(object);
    }
  };

  // Toggle visibility of the selected layer
  const hideSelectedLayer = () => {
    if (!selectedLayer || !canvas) return;

    const object = canvas.getObjects().find((obj: any) => obj.id === selectedLayer);
    if (!object) return;

    if (object.opacity === 0) {
      object.opacity = object.prevOpacity ?? 1;
      object.prevOpacity = undefined;
    } else {
      object.prevOpacity = object.opacity ?? 1;
      object.opacity = 0;
    }

    canvas.renderAll();
    updateLayers();
  };

  useEffect(() => {
    if (canvas) {
      canvas.on("object:added", updateLayers);
      canvas.on("object:removed", updateLayers);
      canvas.on("object:modified", updateLayers);
      canvas.on("selection:created", handleObjectSelected);
      canvas.on("selection:updated", handleObjectSelected);
      canvas.on("selection:cleared", handleObjectSelected);

      updateLayers();

      return () => {
        canvas.off("object:added", updateLayers);
        canvas.off("object:removed", updateLayers);
        canvas.off("object:modified", updateLayers);
        canvas.off("selection:created", handleObjectSelected);
        canvas.off("selection:updated", handleObjectSelected);
        canvas.off("selection:cleared", handleObjectSelected);
      };
    }
  }, [canvas]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => moveSelectedLayer("up")}
          disabled={!selectedLayer || layers[0]?.id === selectedLayer}
        >
          <FaArrowUp />
        </Button>
        <Button
          onClick={() => moveSelectedLayer("down")}
          disabled={
            !selectedLayer || layers[layers.length - 1]?.id === selectedLayer
          }
        >
          <FaArrowUp className="rotate-180" />
        </Button>
        <Button onClick={hideSelectedLayer} disabled={!selectedLayer}>
          {canvas?.getObjects().find((obj: any) => obj.id === selectedLayer)
            ?.opacity === 0 ? (
            <FaEyeSlash />
          ) : (
            <FaEye />
          )}
        </Button>
      </div>

      <div className="space-y-3">
        <h4 className="text-lg font-medium mb-3">Layers</h4>
        <ul className="list-disc ml-6">
          {layers.map((layer) => (
            <li
              key={layer.id}
              onClick={() => selectLayerInCanvas(layer.id)}
              className={`cursor-pointer p-2 ${
                selectedLayer === layer.id
                  ? "border border-blue-500 bg-blue-100"
                  : ""
              }`}
            >
              {layer.type} (zIndex: {layer.zIndex}, opacity: {layer.opacity})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}