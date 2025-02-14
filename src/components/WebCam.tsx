import { useState, useRef, useEffect } from "react";
import { Video, Mic, MicOff, StopCircle, Download } from "lucide-react";

export default function ScreenRecorder() {
    const [countdown, setCountdown] = useState(0);
    const streamRef = useRef<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const recordedChunks = useRef<Blob[]>([]);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);

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
            const tracks = [...streamRef.current.getTracks()];
            const combinedStream = new MediaStream(tracks);
            mediaRecorder.current = new MediaRecorder(combinedStream, { mimeType: "video/webm" });

            mediaRecorder.current.ondataavailable = (event) => {
                if (event.data.size > 0) recordedChunks.current.push(event.data);
            };

            mediaRecorder.current.onstop = () => {
                const blob = new Blob(recordedChunks.current, { type: "video/webm" });
                setVideoUrl(URL.createObjectURL(blob));
                recordedChunks.current = [];

                combinedStream.getTracks().forEach((track) => track.stop());
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((track) => track.stop());
                    streamRef.current = null;
                }
            };

            mediaRecorder.current.start();
            setIsRecording(true);
        }
    }

    async function initiateRecording() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: isAudioEnabled
            });

            if (isAudioEnabled) {
                const audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false
                });
                audioStream.getAudioTracks().forEach((track) => screenStream.addTrack(track));
            }

            streamRef.current = screenStream;
            setCountdown(3);
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
        a.download = "screen_recording.webm";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function toggleAudio() {
        if (isRecording) return;
        setIsAudioEnabled((prev) => !prev);
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            {/* Navigation Bar */}
            <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Video className="w-8 h-8 text-blue-500" />
                        <span className="text-xl font-bold">Screen Recorder</span>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Screen Recorder
                </h1>
                <p className="text-gray-400 text-lg mb-8">Record your screen with optional audio</p>

                {/* Countdown */}
                {countdown > 0 && (
                    <div className="text-6xl font-bold text-blue-500 animate-pulse mb-8">
                        {countdown}
                    </div>
                )}

                {/* Audio Toggle */}
                <button
                    onClick={toggleAudio}
                    className={`px-6 py-3 rounded-lg flex items-center justify-center mx-auto space-x-2 ${isAudioEnabled ? "bg-blue-500" : "bg-gray-700"
                        }`}
                    disabled={isRecording}
                >
                    {isAudioEnabled ? (
                        <>
                            <Mic className="w-5 h-5" />
                            <span>Audio Enabled</span>
                        </>
                    ) : (
                        <>
                            <MicOff className="w-5 h-5" />
                            <span>Audio Disabled</span>
                        </>
                    )}
                </button>

                {/* Recording Controls */}
                <div className="mt-8 space-y-4">
                    <button
                        onClick={isRecording ? stopRecording : initiateRecording}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center mx-auto space-x-2"
                    >
                        {isRecording ? (
                            <>
                                <StopCircle className="w-5 h-5" />
                                <span>Stop Recording</span>
                            </>
                        ) : (
                            <>
                                <Video className="w-5 h-5" />
                                <span>Start Recording</span>
                            </>
                        )}
                    </button>

                    {/* Download Button */}
                    {videoUrl && (
                        <button
                            onClick={downloadVideo}
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg flex items-center justify-center mx-auto space-x-2"
                        >
                            <Download className="w-5 h-5" />
                            <span>Download Recording</span>
                        </button>
                    )}
                </div>

                {/* Video Preview */}
                {videoUrl && (
                    <div className="mt-8">
                        <video
                            controls
                            src={videoUrl}
                            className="max-w-2xl mx-auto rounded-lg shadow-lg"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}