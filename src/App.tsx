import { useState, useRef } from 'react';
import { Mic, MicOff, Video, Square, Download, Play, Pause, Moon, Sun, Github } from 'lucide-react';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamsRef = useRef<MediaStream[]>([]);

  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

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
        streamsRef.current.forEach(stream => {
          stream.getTracks().forEach(track => track.stop());
        });
        streamsRef.current = [];
        
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
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

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800'}`}>
      {/* Header - Fixed at top */}
      <header className={`sticky top-0 z-50 w-full ${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Video className={`h-6 w-6 sm:h-8 sm:w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">CaptureWizard</h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Professional Screen Recording Studio</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} transition-colors duration-200`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="flex gap-2">
                <a 
                  href="https://github.com/iamnas/webloom" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} transition-colors duration-200`}
                >
                  <Github size={20} />
                </a>

              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Flexible space */}
      <main className="flex-grow px-4 py-8">
        <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} p-4 sm:p-8 rounded-xl shadow-2xl backdrop-blur-sm max-w-2xl mx-auto`}>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Screen Recorder</h2>
          
          <div className="space-y-6">
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-3 rounded-full ${
                  audioEnabled 
                    ? (darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-500/20 text-green-600')
                    : (darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-500/20 text-red-600')
                } transition-colors duration-200 ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={audioEnabled ? "Audio Enabled" : "Audio Disabled"}
                disabled={isRecording}
              >
                {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
              </button>
              
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-4 sm:px-6 py-3 rounded-full flex items-center gap-2 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : (darkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700')
                } transition-colors duration-200 text-white`}
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
                    className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 flex items-center gap-2 transition-colors duration-200 text-white"
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
              <p className="animate-pulse">Recording in progress... Press Stop when you're ready</p>
            ) : (
              <p>Choose your options then click Start Recording</p>
            )}
          </div>
        </div>
      </main>

      {/* Footer - Fixed at bottom */}
      <footer className={`mt-auto w-full ${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="font-medium">Made with ❤️ by <a href="https://x.com/0xnas_eth" target="_blank" rel="noopener noreferrer" className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors duration-200`}>0xnas</a> 🚀</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="h-1 w-1 rounded-full bg-blue-400 animate-pulse"></div>
            <div className="h-1 w-1 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
            <div className="h-1 w-1 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            <div className="h-1 w-1 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: "0.6s" }}></div>
            <div className="h-1 w-1 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: "0.8s" }}></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;