// import { useState, useRef } from "react";
// import { Camera, StopCircle, Download, Video } from "lucide-react";

// export default function Recorder() {
// const [isRecording, setIsRecording] = useState<boolean>(false);
// const [videoUrl, setVideoUrl] = useState<string | null>(null);
// const mediaRecorder = useRef<MediaRecorder | null>(null);
// const recordedChunks = useRef<Blob[]>([]);

//   async function startRecording() {
//     const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
//     mediaRecorder.current = new MediaRecorder(stream, { mimeType: "video/webm" });

//     mediaRecorder.current.ondataavailable = (event) => {
//       if (event.data.size > 0) recordedChunks.current.push(event.data);
//     };

//     mediaRecorder.current.onstop = () => {
//       const blob = new Blob(recordedChunks.current, { type: "video/webm" });
//       setVideoUrl(URL.createObjectURL(blob));
//       recordedChunks.current = [];
//     };

//     mediaRecorder.current.start();
//     setIsRecording(true);
//   }

//   function stopRecording() {
//     mediaRecorder.current?.stop();
//     setIsRecording(false);
//   }

//   function downloadVideo() {
//     if (!videoUrl) return;
//     const a = document.createElement("a");
//     a.href = videoUrl;
//     a.download = "recording.webm";
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
//       {/* Navigation Bar */}
//       <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
//         <div className="container mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <Video className="w-8 h-8 text-blue-500" />
//               <span className="text-xl font-bold">WebLoom</span>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <div className="container mx-auto px-6 py-12">
//         <div className="max-w-4xl mx-auto">
//           {/* Hero Section */}
//           <div className="text-center mb-12">
//             <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
//               Screen Recorder
//             </h1>
//             <p className="text-gray-400 text-lg">
//               Record your screen with just one click. Share your knowledge effortlessly.
//             </p>
//           </div>

//           {/* Recording Controls */}
//           <div className="flex justify-center mb-8">
//             {isRecording ? (
//               <button
//                 onClick={stopRecording}
//                 className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
//               >
//                 <StopCircle className="w-5 h-5" />
//                 <span>Stop Recording</span>
//               </button>
//             ) : (
//               <button
//                 onClick={startRecording}
//                 className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
//               >
//                 <Camera className="w-5 h-5" />
//                 <span>Start Recording</span>
//               </button>
//             )}
//           </div>

//           {/* Video Preview */}
//           {videoUrl && (
//             <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
//               <video 
//                 controls 
//                 src={videoUrl} 
//                 className="w-full rounded-lg shadow-xl mb-4 aspect-video"
//               ></video>
//               <div className="flex justify-center">
//                 <button
//                   onClick={downloadVideo}
//                   className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
//                 >
//                   <Download className="w-5 h-5" />
//                   <span>Download Recording</span>
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useRef, useEffect } from "react";
import { Camera, StopCircle, Download, Video } from "lucide-react";

export default function Recorder() {

  const [countdown, setCountdown] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);


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
      mediaRecorder.current = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        setVideoUrl(URL.createObjectURL(blob));
        recordedChunks.current = [];
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    }
  }

  async function initiateRecording() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      streamRef.current = stream;
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
    a.download = "recording.webm";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
              Record your screen with just one click. Share your knowledge effortlessly.
            </p>
          </div>

          {/* Countdown Display */}
          {countdown > 0 && (
            <div className="flex justify-center mb-8">
              <div className="text-6xl font-bold text-blue-500 animate-pulse">
                {countdown}
              </div>
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
                disabled={countdown > 0}
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