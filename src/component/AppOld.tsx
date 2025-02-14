import  { useState, useRef } from 'react';
import { Mic, MicOff, Video, Square, Download, Play, Pause } from 'lucide-react';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamsRef = useRef<MediaStream[]>([]);

  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

      // Add track ended listener to stop recording when screen share stops
      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
      });

      let combinedStream = displayStream;
      streamsRef.current = [displayStream];

      if (audioEnabled) {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        combinedStream = new MediaStream([
          ...displayStream.getTracks(),
          ...audioStream.getTracks()
        ]);
        streamsRef.current.push(audioStream);
      }

      const mediaRecorder = new MediaRecorder(combinedStream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        
        setRecordedChunks(chunks);
        // Stop all tracks from all streams
        streamsRef.current.forEach(stream => {
          stream.getTracks().forEach(track => track.stop());
        });
        streamsRef.current = [];
        
        // Create preview URL
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      // Clear previous preview
      setPreviewUrl('');
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) return;

    const blob = new Blob(recordedChunks, {
      type: 'video/webm'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = 'screen-recording.webm';
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center p-6">
      <div className="bg-gray-800/50 p-8 rounded-xl shadow-2xl backdrop-blur-sm w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Screen Recorder</h1>
        
        <div className="space-y-6">
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-3 rounded-full ${
                audioEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              } transition-colors duration-200 ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={audioEnabled ? "Audio Enabled" : "Audio Disabled"}
              disabled={isRecording}
            >
              {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
            </button>
            
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-6 py-3 rounded-full flex items-center gap-2 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } transition-colors duration-200`}
            >
              {isRecording ? (
                <>
                  <Square size={20} /> Stop Recording
                </>
              ) : (
                <>
                  <Video size={20} /> Start Recording
                </>
              )}
            </button>
          </div>

          {previewUrl && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  src={previewUrl}
                  className="w-full"
                  onEnded={() => setIsPlaying(false)}
                />
                <button
                  onClick={togglePlayback}
                  className="absolute bottom-4 left-4 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={downloadRecording}
                  className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 flex items-center gap-2 transition-colors duration-200"
                >
                  <Download size={20} />
                  Download Recording
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          {isRecording ? (
            <p className="animate-pulse">Recording in progress...</p>
          ) : (
            <p>Click Start Recording to begin</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;