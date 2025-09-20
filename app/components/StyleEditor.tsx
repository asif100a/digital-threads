import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Canvas } from "fabric";
import React, { useEffect, useRef, useState } from "react";

type TColor = {
  id: string;
  color: string;
};

export default function StyleEditor({ canvas }: { canvas: typeof Canvas }) {
  const [colors, setColors] = useState<TColor[]>([]);
  const [newColor, setNewColor] = useState("#FF0000");
  const colorInputRef = useRef(null);

  useEffect(() => {
    const savedColors = localStorage.getItem("canvasStyles");
    if (savedColors) {
      const colors = JSON.parse(savedColors);
      setColors(colors);
    } else setColors([]);
  }, []);

  const addColor = () => {
    const id = `color_${Date.now()}`;
    const updateColors = [...colors, { id, color: newColor }];
    setColors(updateColors);
    // console.log("Colors: ", colors);
  };

  const openColorPicker = () => {
    if (!colorInputRef.current) return;

    colorInputRef.current?.click();
  };

  const saveColors = () => {
    localStorage.setItem("canvasStyles", JSON.stringify(colors));

    canvas?.getObjects()?.forEach((object) => {
      const objectStyleID = object.get("styleID");
      const colorToUpdate = colors?.find((color) => color.id === objectStyleID);
      if (colorToUpdate && object.get("fill") !== colorToUpdate.color) {
        object.set("fill", colorToUpdate.color);
      }
    });
    canvas.renderAll();
  };

  const applyStyle = (color, id) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set("fill", color);
      activeObject.set("styleID", id);
      canvas.renderAll();
    }
  };

  const updateColor = (id, newColor) => {
    const updateColors = colors?.map((item) =>
      item.id === id ? { ...item, color: newColor } : item
    );
    setColors(updateColors);
  };

  const openColorPickerById = (id: string) => {
    document.getElementById(`color-${id}`)?.click();
  };

  return (
    <div>
      <Input
        ref={colorInputRef}
        type="color"
        value={newColor}
        onChange={(e) => setNewColor(e.target.value)}
        className={`w-0 h-0 opacity-0 pointer-events-none`}
      />
      <h4 className="text-lg font-semibold mb-2">Style Editor</h4>
      <div className="flex items-center gap-6">
        <div
          onClick={openColorPicker}
          style={{ backgroundColor: newColor }}
          className="w-10 h-8"
        ></div>
        <Button onClick={addColor}>Add Color</Button>
      </div>

      <hr className="my-3" />

      <div className="grid grid-cols-4 gap-3 mb-3">
        {colors.map(({ id, color }) => (
          <button
            key={id}
            className="w-12 h-8 text-sm rounded-sm"
            style={{ backgroundColor: color }}
            onClick={() => applyStyle(color, id)}
          >
            Apply
          </button>
        ))}
      </div>

      <div className="">
        <h4 className="text-lg font-semibold mb-2">Edit Styles</h4>
        <div className="grid grid-cols-4 gap-3">
          {colors.map(({ id, color }) => (
            <div className="">
              <Input
                id={`color-${id}`}
                className="pointer-events-none opacity-0 w-0 h-0"
                type="color"
                value={color}
                onChange={(e) => updateColor(id, e.target.value)}
              />

              <div
                onClick={() => openColorPickerById(id)}
                style={{ backgroundColor: color }}
                className="w-10 h-8"
              ></div>
              <Input
                type="text"
                value={color}
                onChange={(e) => updateColor(id, e.target.value)}
              />
              {/* <Button onClick={addColor}>Add Color</Button> */}
            </div>
          ))}
        </div>
      </div>

      <Button onClick={saveColors}>Save Colors</Button>
    </div>
  );
}
