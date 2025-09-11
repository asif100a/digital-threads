"use client";

import React, { useEffect } from "react";
import * as fabric from "fabric";

export default function Design() {
  useEffect(() => {
    const canvas = new fabric.Canvas("design-canvas", {
      width: 500,
      height: 550,
    });
  }, []);

  return (
    <section className="py-24">
      <div className="p-6 flex flex-col items-center">
        <canvas id="design-canvas" className="border" />
      </div>
    </section>
  );
}
