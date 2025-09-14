import type { Canvas as FabricCanvas, Rect as FabricRect, Circle as FabricCircle } from "fabric";

declare module "fabric" {
  export const Canvas: typeof FabricCanvas;
  export const Rect: typeof FabricRect;
  export const Circle: typeof FabricCircle;
}
