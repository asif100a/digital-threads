import { Line, Canvas, type FabricObject } from "fabric";

const snappingDistance = 10;

export interface Guideline extends Line {
  id?: string;
}

export const handleObjectMoving = (
  canvas: typeof Canvas,
  obj: FabricObject,
  guidelines: Guideline[],
  setGuidelines: React.Dispatch<React.SetStateAction<Guideline[]>>
) => {
  const canvasWidth = canvas.width || 500;
  const canvasHeight = canvas.height || 600;

  const left = obj.left || 0;
  const top = obj.top || 0;
  const width = (obj.width || 0) * (obj.scaleX || 1);
  const height = (obj.height || 0) * (obj.scaleY || 1);
  const right = left + width;
  const bottom = top + height;
  const centerX = left + width / 2;
  const centerY = top + height / 2;

  let newGuidelines: Guideline[] = [];
  clearGuideLines(canvas, guidelines, setGuidelines);

  let snapped = false;

  // Snap to left edge
  if (Math.abs(left) < snappingDistance) {
    obj.set({ left: 0 });
    if (!guidelineExists(canvas, "vertical-left")) {
      const line = createVerticalGuideline(canvas, 0, "vertical-left");
      newGuidelines.push(line);
      canvas.add(line);
    }
    snapped = true;
  }

  // Snap to right edge
  if (Math.abs(right - canvasWidth) < snappingDistance) {
    obj.set({ left: canvasWidth - width });
    if (!guidelineExists(canvas, "vertical-right")) {
      const line = createVerticalGuideline(canvas, canvasWidth, "vertical-right");
      newGuidelines.push(line);
      canvas.add(line);
    }
    snapped = true;
  }

  // Snap to top edge
  if (Math.abs(top) < snappingDistance) {
    obj.set({ top: 0 });
    if (!guidelineExists(canvas, "horizontal-top")) {
      const line = createHorizontalGuideline(canvas, 0, "horizontal-top");
      newGuidelines.push(line);
      canvas.add(line);
    }
    snapped = true;
  }

  // Snap to bottom edge
  if (Math.abs(bottom - canvasHeight) < snappingDistance) {
    obj.set({ top: canvasHeight - height });
    if (!guidelineExists(canvas, "horizontal-bottom")) {
      const line = createHorizontalGuideline(canvas, canvasHeight, "horizontal-bottom");
      newGuidelines.push(line);
      canvas.add(line);
    }
    snapped = true;
  }

  // Snap to center (horizontal)
  if (Math.abs(centerX - canvasWidth / 2) < snappingDistance) {
    obj.set({ left: canvasWidth / 2 - width / 2 });
    if (!guidelineExists(canvas, "vertical-center")) {
      const line = createVerticalGuideline(canvas, canvasWidth / 2, "vertical-center");
      newGuidelines.push(line);
      canvas.add(line);
    }
    snapped = true;
  }

  // Snap to center (vertical)
  if (Math.abs(centerY - canvasHeight / 2) < snappingDistance) {
    obj.set({ top: canvasHeight / 2 - height / 2 });
    if (!guidelineExists(canvas, "horizontal-center")) {
      const line = createHorizontalGuideline(canvas, canvasHeight / 2, "horizontal-center");
      newGuidelines.push(line);
      canvas.add(line);
    }
    snapped = true;
  }

  if (snapped) {
    setGuidelines(newGuidelines);
  } else {
    setGuidelines([]);
  }

  canvas.renderAll();
};

export const createVerticalGuideline = (canvas: typeof Canvas, x: number, id: string): Guideline => {
  return new Line([x, 0, x, canvas.height || 600], {
    id,
    stroke: "red",
    strokeWidth: 1,
    selectable: false,
    evented: false,
    strokeDashArray: [5, 5],
    opacity: 0.8,
  });
};

export const createHorizontalGuideline = (canvas: typeof Canvas, y: number, id: string): Guideline => {
  return new Line([0, y, canvas.width || 500, y], {
    id,
    stroke: "red",
    strokeWidth: 1,
    selectable: false,
    evented: false,
    strokeDashArray: [5, 5],
    opacity: 0.8,
  });
};

export const guidelineExists = (canvas: typeof Canvas, id: string): boolean => {
  return canvas.getObjects("line").some((obj: Guideline) => obj.id === id);
};

export const clearGuideLines = (
  canvas: typeof Canvas,
  guidelines: Guideline[],
  setGuidelines: React.Dispatch<React.SetStateAction<Guideline[]>>
) => {
  const objects = canvas.getObjects("line") as Guideline[];
  objects.forEach((obj) => {
    if (obj.id && (obj.id.startsWith("vertical-") || obj.id.startsWith("horizontal-"))) {
      canvas.remove(obj);
    }
  });
  setGuidelines([]);
  canvas.renderAll();
};