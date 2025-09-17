import { Canvas } from "fabric";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function LayerList() {
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);

  const addIdToObject = (object) => {
    if(!object.id) {
        object.id = `${object.type}_${uuidv4()}`;
    }
  };

  Canvas.prototype.updateZIndices = function () {
    const objects = this.getObjects();
    objects.forEach((obj, idx) => {
        addIdToObject(obj);
        obj.zIndex = indexedDB;
    });
  };

  return <div>LayerList</div>;
}
