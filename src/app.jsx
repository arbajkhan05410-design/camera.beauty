import { useEffect, useRef, useState } from "react";

const filters = {
  Normal: "none",
  Bright: "brightness(1.4)",
  Dark: "brightness(0.6)",
  Soft: "contrast(0.8) saturate(1.2)",
  Vibrant: "saturate(1.8)",
  Warm: "sepia(0.4)",
  Cool: "hue-rotate(200deg)",
  Smooth: "blur(1px)",
  Sharp: "contrast(1.4)",
  BlackWhite: "grayscale(1)"
};

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const [selectedFilter, setSelectedFilter] = useState("Normal");
  const [recording, setRecording] = useState(false);

  const [stream, setStream] = useState(null);

  useEffect(() => {
    startCamera();
  }, []);

  async function startCamera() {
    const camStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true     // MIC AUDIO ENABLED
    });

    videoRef.current.srcObject = camStream;
    setStream(camStream);
  }

  function capturePhoto() {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.filter = filters[selectedFilter];
    ctx.drawImage(video, 0, 0);

    const link = document.createElement("a");
    link.download = "photo.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function startRecording() {
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorderRef.current = recorder;

    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.webm";
      a.click();
    };

    recorder.start();
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current.stop();
    setRecording(false);
  }

  return (
    <div className="container">
      <h1>Beauty Camera</h1>

      <video
        ref={videoRef}
        autoPlay
        style={{ filter: filters[selectedFilter] }}
      ></video>

      <select
        value={selectedFilter}
        onChange={(e) => setSelectedFilter(e.target.value)}
      >
        {Object.keys(filters).map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <div>
        <button onClick={capturePhoto}>📸 Capture Photo</button>

        {!recording && <button onClick={startRecording}>🎥 Start Recording</button>}
        {recording && <button onClick={stopRecording}>⏹ Stop Recording</button>}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </div>
  );
}