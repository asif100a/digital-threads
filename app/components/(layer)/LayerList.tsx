import { Button } from "@/components/ui/button";
import { Canvas } from "fabric";
import React, { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

// Define types for clarity
interface Layer {
  id: string;
  zIndex: number;
  type: string;
}

interface LayerOpacityMap {
  [key: string]: number; // Maps layer ID to its original opacity
}

interface LayerListProps {
  canvas: typeof Canvas;
}

export default function LayerList({ canvas }: LayerListProps) {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [layerOpacityMap, setLayerOpacityMap] = useState<LayerOpacityMap>({});

  // Toggle layer visibility (opacity)
  const hideSelectedLayer = (layerId: string) => {
    if (!layerId) return;

    const object = canvas.getObjects().find((obj) => obj.id === layerId);
    if (!object) return;

    setLayerOpacityMap((prevMap) => {
      const newMap = { ...prevMap };

      // Store original opacity if not already stored
      if (!(layerId in newMap)) {
        newMap[layerId] = object.opacity ?? 1; // Default to 1 if opacity is undefined
      }

      // Toggle opacity: if 0, restore to original; if non-zero, set to 0
      object.opacity = object.opacity === 0 ? newMap[layerId] : 0;

      canvas.renderAll();
      return newMap;
    });
  };

  const moveSelectedLayer = (direction: "up" | "down") => {
    if (!selectedLayer) return;

    const objects = canvas.getObjects();
    const object = objects.find((obj) => obj.id === selectedLayer);

    if (object) {
      const currentIndex = objects.indexOf(object); // Use indexOf on array

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

  // Add unique ID to canvas objects
  const addIdToObject = (object: fabric.Object) => {
    if (!object.id) {
      object.id = `${object.type}_${uuidv4()}`;
    }
  };

  // Update zIndex for all objects based on their position in the canvas stack
  Canvas.prototype.updateZIndices = function () {
    const objects = this.getObjects();
    objects.forEach((obj, idx) => {
      addIdToObject(obj);
      obj.zIndex = idx;
    });
  };

  // Update the layers state with current canvas objects
  const updateLayers = () => {
    if (canvas) {
      canvas.updateZIndices();
      const objects = canvas
        .getObjects()
        .filter(
          (obj) =>
            !(
              obj.id?.startsWith("vertical-") ||
              obj.id?.startsWith("horizontal-")
            )
        )
        .map((obj) => ({
          id: obj.id,
          zIndex: obj.zIndex,
          type: obj.type,
        }));

      setLayers([...objects].reverse()); // Reverse to show topmost layer first
    }
  };

  // Handle object selection on the canvas
  const handleObjectSelected = (e: fabric.IEvent) => {
    const selectedObject = e.selected ? e.selected[0] : null;
    setSelectedLayer(selectedObject ? selectedObject.id : null);
  };

  // Select a layer by clicking on it in the list
  const selectLayerInCanvas = (layerId: string) => {
    const object = canvas.getObjects().find((obj) => obj.id === layerId);
    if (object) {
      canvas.setActiveObject(object);
      canvas.renderAll();
    }
  };

  // Move a layer up or down in the stack
  const moveLayer = (layerId: string, direction: "up" | "down") => {
    const object = canvas.getObjects().find((obj) => obj.id === layerId);
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
          <FaArrowUp className="rotate-180" /> {/* Rotate for down arrow */}
        </Button>
      </div>

      <div className="space-y-3">
        <h4 className="text-lg font-medium mb-3">Layers</h4>
        <ul className="list-disc">
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
              {layer.type} (zIndex: {layer.zIndex})
              <div className="inline ml-4">
                <button
                  onClick={() => moveLayer(layer.id, "up")}
                  disabled={layer.zIndex >= canvas?.getObjects().length - 1}
                  className="ml-2 px-2 py-1 bg-gray-200 rounded"
                >
                  Up
                </button>
                <button
                  onClick={() => moveLayer(layer.id, "down")}
                  disabled={layer.zIndex <= 0}
                  className="ml-2 px-2 py-1 bg-gray-200 rounded"
                >
                  Down
                </button>
                <button
                  onClick={() => hideSelectedLayer(layer.id)}
                  className="ml-2 px-2 py-1 bg-gray-200 rounded"
                >
                  Hide Visibility
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}