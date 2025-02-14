import { useState, useRef, useEffect } from "react";
import { Camera, StopCircle, Download, Video, Mic, MicOff, VideoOff } from "lucide-react";

export default function WebCam() {
  const [countdown, setCountdown] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown === 1) {
          startRecording();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  async function startRecording() {
    if (streamRef.current) {
      const tracks: MediaStreamTrack[] = [...streamRef.current.getTracks()];
      
      // Add camera track if enabled
      if (cameraStreamRef.current && isCameraEnabled) {
        const videoTrack = cameraStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          tracks.push(videoTrack);
        }
      }

      // Create a new combined stream
      const combinedStream = new MediaStream(tracks);
      
      mediaRecorder.current = new MediaRecorder(combinedStream, { mimeType: "video/webm" });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        setVideoUrl(URL.createObjectURL(blob));
        recordedChunks.current = [];
        
        // Stop all tracks
        combinedStream.getTracks().forEach(track => track.stop());
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach(track => track.stop());
          cameraStreamRef.current = null;
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    }
  }

  async function initiateRecording() {
    try {
      // Get display media (screen)
      const displayOptions: DisplayMediaStreamOptions = { 
        video: true,
        audio: isAudioEnabled 
      };
      const screenStream = await navigator.mediaDevices.getDisplayMedia(displayOptions);
      streamRef.current = screenStream;
      
      // Setup camera if enabled
      if (isCameraEnabled) {
        try {
          const cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: isAudioEnabled // Audio comes from screen capturing if enabled
          });
          cameraStreamRef.current = cameraStream;
          
          // Show camera preview
          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = cameraStream;
            videoPreviewRef.current.play();
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setIsCameraEnabled(false);
        }
      }
      
      setCountdown(3); // Start countdown after screen is selected
    } catch (error) {
      console.error("Error accessing screen:", error);
    }
  }

  function stopRecording() {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  }

  function downloadVideo() {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "webl00m_001.webm";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function toggleCamera() {
    if (isRecording) return; // Don't toggle during recording
    setIsCameraEnabled(prev => !prev);
  }

  function toggleAudio() {
    if (isRecording) return; // Don't toggle during recording
    setIsAudioEnabled(prev => !prev);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Navigation Bar */}
      <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Video className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold">WebLoom</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Screen Recorder
            </h1>
            <p className="text-gray-400 text-lg">
              Record your screen with optional camera and audio. Share your knowledge effortlessly.
            </p>
          </div>

          {/* Camera Preview (when enabled) */}
          {isCameraEnabled && !isRecording && !videoUrl && (
            <div className="mb-8 flex justify-center">
              <div className="relative w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-blue-500">
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                ></video>
                <div className="absolute bottom-2 right-2 text-xs bg-blue-500 px-2 py-1 rounded-full">
                  Camera Preview
                </div>
              </div>
            </div>
          )}

          {/* Countdown Display */}
          {countdown > 0 && (
            <div className="flex justify-center mb-8">
              <div className="text-6xl font-bold text-blue-500 animate-pulse">
                {countdown}
              </div>
            </div>
          )}

          {/* Option Toggles */}
          {!isRecording && !videoUrl && (
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={toggleCamera}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isCameraEnabled
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {isCameraEnabled ? <Camera className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                <span>{isCameraEnabled ? "Camera On" : "Camera Off"}</span>
              </button>
              <button
                onClick={toggleAudio}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isAudioEnabled
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                <span>{isAudioEnabled ? "Audio On" : "Audio Off"}</span>
              </button>
            </div>
          )}

          {/* Recording Controls */}
          <div className="flex justify-center mb-8">
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <StopCircle className="w-5 h-5" />
                <span>Stop Recording</span>
              </button>
            ) : (
              <button
                onClick={initiateRecording}
                disabled={countdown > 0 || isRecording}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-5 h-5" />
                <span>Start Recording</span>
              </button>
            )}
          </div>

          {/* Video Preview */}
          {videoUrl && (
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <video
                controls
                src={videoUrl}
                className="w-full rounded-lg shadow-xl mb-4 aspect-video"
              ></video>
              <div className="flex justify-center">
                <button
                  onClick={downloadVideo}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Recording</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}