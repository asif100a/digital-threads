import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FabricImage } from "fabric";
import type { Canvas as FabricCanvas } from "fabric";
import { UploadIcon } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { FaRecordVinyl, FaStopCircle } from "react-icons/fa";

type VideoProps = {
  canvas: typeof FabricCanvas;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
};

type FabricVideoType = InstanceType<typeof FabricImage>;

export default function Video({ canvas, canvasRef }: VideoProps) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [fabricVideo, setFabricVideo] = useState<FabricVideoType | null>(null);
  const [recordingChunks, setRecordingChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [loadPercentage, setLoadPercentage] = useState<number>(0);
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format recording time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  const file = files[0];

    if (file) {
      setLoadPercentage(0);
      setVideoSrc(null);
      setUploadMessage("");

      const url = URL.createObjectURL(file);
  setVideoSrc(url);

      const videoElement = document.createElement("video");
      videoElement.src = url;
      videoElement.crossOrigin = "anonymous";
      videoElement.muted = true;
      videoElement.load();

      videoElement.addEventListener("loadeddata", () => {
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;
        videoElement.width = videoWidth;
        videoElement.height = videoHeight;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const scale = Math.min(canvasWidth / videoWidth, canvasHeight / videoHeight);

        const fabricImage = new FabricImage(videoElement, {
          left: 0,
          top: 0,
          scaleX: scale,
          scaleY: scale,
        });

        setFabricVideo(fabricImage);
        canvas.add(fabricImage);
        canvas.renderAll();

        setUploadMessage("Uploaded");
        setTimeout(() => {
          setUploadMessage("");
        }, 3000);
      });

      videoElement.addEventListener("progress", () => {
        if (videoElement.buffered.length > 0) {
          const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
          const duration = videoElement.duration;
          if (duration > 0) {
            setLoadPercentage((bufferedEnd / duration) * 100);
          }
        }
      });

      videoElement.addEventListener("error", (error) => {
        console.error("Video load failed: ", error);
        setUploadMessage("Failed to load video");
      });

  videoRef.current = videoElement;
    }
  };

  const handlePlayPauseVideo = () => {
    if (videoRef.current && fabricVideo) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch((error: any) => {
          console.error("Video playback failed: ", error);
        });
        const updateCanvas = () => {
          if (!videoRef.current) return;
          fabricVideo.setElement(videoRef.current);
          canvas.renderAll();
          if (!videoRef.current.paused) {
            requestAnimationFrame(updateCanvas);
          }
        };
        requestAnimationFrame(updateCanvas);
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleStopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      canvas.renderAll();
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleStartRecording = () => {
    if (!canvasRef?.current?.captureStream) {
      console.error("Canvas captureStream is not supported in this browser");
      setUploadMessage("Recording is not supported in this browser");
      return;
    }
    if (!canvasRef.current) return;
    const stream = canvasRef.current.captureStream(25);
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = handleDataAvailable;
    mediaRecorderRef.current.start();
    setIsRecording(true);

    canvas.getObjects().forEach((obj: any) => {
      obj.hasControls = false;
      obj.selectable = true;
    });
    canvas.renderAll();

    setRecordingTime(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      canvas.getObjects().forEach((obj: any) => {
        obj.hasControls = false;
      });
      canvas.renderAll();

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      setRecordingChunks((prev) => [...prev, event.data]);
    }
  };

  const handleExportVideo = () => {
    const blob = new Blob(recordingChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "canvas-video.webm";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);

    setRecordingChunks([]);
  };

  useEffect(() => {
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  return (
    <div className="relative">
      {isRecording && (
        <div className="absolute top-0 left-0 w-full text-center bg-gray-800 text-white py-2">
          <p className="text-lg font-semibold">Recording: {formatTime(recordingTime)}</p>
        </div>
      )}
      <Input
        type="file"
        accept="video/mp4"
        ref={fileInputRef}
        onChange={handleVideoUpload}
        className="hidden"
      />

      <UploadIcon onClick={handleUploadButtonClick} className="mx-auto" />

      <div className="flex flex-col gap-y-4">
        <Button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className="mt-12 w-fit mx-auto"
        >
          {isRecording ? <FaStopCircle /> : <FaRecordVinyl />}
        </Button>

        <Button onClick={handleExportVideo} disabled={!recordingChunks.length}>
          Export Video
        </Button>
      </div>

      {videoSrc && (
        <div className="mt-12">
          <div className="w-fit border p-1 flex items-center gap-4">
            <Button onClick={handlePlayPauseVideo}>
              {isPlaying ? "Pause" : "Play"}
            </Button>

            <Button onClick={handleStopVideo}>Stop</Button>
          </div>

          <div>
            <p>Progress: {loadPercentage.toFixed(2)}%</p>
          </div>
          {uploadMessage && (
            <p className="text-sm text-shadow-2xs">{uploadMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}