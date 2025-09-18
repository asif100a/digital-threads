import { Canvas } from "fabric";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function LayerList({ canvas }) {
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);

  // Add unique ID to canvas objects
  const addIdToObject = (object) => {
    if (!object.id) {
      object.id = `${object.type}_${uuidv4()}`;
    }
  };

  // Update zIndex for all objects based on their position in the canvas stack
  Canvas.prototype.updateZIndices = function () {
    const objects = this.getObjects();
    objects.forEach((obj, idx) => {
      addIdToObject(obj);
      obj.zIndex = idx; // Use idx instead of indexedDB
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
  const handleObjectSelected = (e) => {
    const selectedObject = e.selected ? e.selected[0] : null;
    setSelectedLayer(selectedObject ? selectedObject.id : null);
  };

  // Select a layer by clicking on it in the list
  const selectLayerInCanvas = (layerId) => {
    const object = canvas.getObjects().find((obj) => obj.id === layerId);
    if (object) {
      canvas.setActiveObject(object);
      canvas.renderAll();
    }
  };

  // Move a layer up or down in the stack
  const moveLayer = (layerId, direction) => {
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
      // Attach event listeners for canvas changes
      canvas.on("object:added", updateLayers);
      canvas.on("object:removed", updateLayers);
      canvas.on("object:modified", updateLayers);
      canvas.on("selection:created", handleObjectSelected);
      canvas.on("selection:updated", handleObjectSelected);
      canvas.on("selection:cleared", handleObjectSelected);

      // Initial update
      updateLayers();

      // Cleanup event listeners
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
    <div>
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
