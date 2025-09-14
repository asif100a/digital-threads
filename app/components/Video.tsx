import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FabricImage } from "fabric";
import { UploadIcon } from "lucide-react";
import React, { useRef, useState } from "react";

export default function Video({ canvas, canvasRef }) {
  const [videoSrc, setVideoSrc] = useState(null);
  const [fabricVideo, setFabricVideo] = useState(null);
  const [recordingChunks, setRecordingChunks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [loadPercentage, setLoadPercentage] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      setLoadPercentage(0);
      setVideoSrc(null);
      setUploadMessage("");

      const url = URL.createObjectURL(file);

      const videoElement = document.createElement("video");
      videoElement.src = url;
      videoElement.crossOrigin = "anonymous";

      videoElement.addEventListener("loadeddata", () => {
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;
        videoElement.width = videoWidth;
        videoElement.height = videoHeight;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const scale = Math.min(
          canvasWidth / videoWidth,
          canvasHeight / videoHeight
        );

        canvas.renderAll();

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
          const bufferedEnd = videoElement.buffered.end(
            videoElement.buffered.length - 1
          );
          const duration = videoElement.duration;
          if (duration > 0) {
            setLoadPercentage((bufferedEnd / duration) * 100);
          }
        }
      });

      videoElement.addEventListener("error", (error) => {
        console.error("Video load failed: ", error);
      });

      videoRef.current = videoElement;
    }
  };

  const handlePlayPauseVideo = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        videoRef.current.addEventListener("timeupdate", () => {
          fabricVideo.setElement(videoRef.current);
          canvas.renderAll();
        });
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
    fileInputRef.current.click();
  };

  // Recording Video
  const handleStartRecording = () => {
    const stream = canvasRef.current.captureStream();
    mediaRecorderRef.current.ondataavailable = handleDataAvailable;
    mediaRecorderRef.current.start();
    setIsRecording(true);

    canvas.getObjects().forEach((obj) => {
        obj.hasControl = false;
        obj.selectable = true;
    });
    canvas.renderAll();

    setRecordingTime(0);
    recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev: number) => prev + 1);
    }, 1000);
  };

  return (
    <div>
      <Input
        type="file"
        accept="video/mp4"
        ref={fileInputRef}
        onChange={handleVideoUpload}
        className="hidden"
      />

      <UploadIcon onClick={handleUploadButtonClick} />
      {console.log("videoSrc: ", videoSrc)}

      {videoSrc && (
        <div className="absolute bottom-0 left-1/2">
          <div className="w-fit border p-1 flex items-center gap-4">
            <Button onClick={handlePlayPauseVideo}>
              {isPlaying ? "Pause" : "Play"}
            </Button>

            <Button onClick={handleStopVideo}>Stop</Button>
          </div>
        </div>
      )}
    </div>
  );
}
