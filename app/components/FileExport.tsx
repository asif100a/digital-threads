import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Canvas } from "fabric";
import React, { useRef } from "react";
import { toast } from "react-toastify";

export default function FileExport({ canvas }: { canvas: typeof Canvas }) {
  const uploadFileRef = useRef<HTMLInputElement>(null);

  const exportCanvas = () => {
    if (!canvas) return;

    const json = canvas.toJSON();
    const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "canvas.json";
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files?.length < 1) return;

    const file = files && files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader?.result as string);
          canvas.clear();
          canvas.loadFromJSON(json);
        } catch (error) {
          console.error("Failed to read the json file: ", error);
        }
      };
      reader.readAsText(file);
    } else {
      toast.error("Please upload a valid JSON file");
    }
  };

  const uploadFile = () => {
    if (!uploadFileRef.current) return;

    uploadFileRef?.current?.click();
  };

  return (
    <div className="flex gap-3 items-center">
      <Button type="button" onClick={uploadFile}>
        Import File
      </Button>
      <Input
        ref={uploadFileRef}
        type="file"
        accept="application/json"
        onChange={handleFileUpload}
        className="hidden"
      />

      <Button type="button" onClick={exportCanvas}>
        Export Canvas
      </Button>
    </div>
  );
}
