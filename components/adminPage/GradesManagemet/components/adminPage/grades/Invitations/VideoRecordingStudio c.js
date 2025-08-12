import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  X, 
  Camera,
  Square,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Mic,
  MicOff,
  Monitor,
  Smartphone,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const VideoRecordingStudio = ({ onClose, recordingType = 'messaging' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaStream, setMediaStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [cameraError, setCameraError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoQuality, setVideoQuality] = useState('720p');
  const [cameraFacing, setCameraFacing] = useState('user');

  const videoRef = useRef(null);
  const playbackRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  const initializeCamera = async () => {
    try {
      setCameraError(null);
      
      const constraints = {
        video: {
          width: { ideal: videoQuality === '1080p' ? 1920 : 1280 },
          height: { ideal: videoQuality === '1080p' ? 1080 : 720 },
          facingMode: cameraFacing
        },
        audio: audioEnabled
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError(getErrorMessage(error));
    }
  };

  const getErrorMessage = (error) => {
    switch (error.name) {
      case 'NotAllowedError':
        return 'Camera access denied. Please allow camera permissions and refresh.';
      case 'NotFoundError':
        return 'No camera found. Please connect a camera and try again.';
      case 'NotReadableError':
        return 'Camera is being used by another application.';
      default:
        return 'Failed to access camera. Please check your browser settings.';
    }
  };

  const cleanup = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startRecording = async () => {
    if (!mediaStream) {
      await initializeCamera();
      return;
    }

    try {
      const recorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      setRecordedChunks([]);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        setRecordedVideo(blob);
      };

      recorder.start(100); // Collect data every 100ms
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && isRecording) {
      if (isPaused) {
        mediaRecorder.resume();
        setIsPaused(false);
      } else {
        mediaRecorder.pause();
        setIsPaused(true);
      }
    }
  };

  const resetRecording = () => {
    setRecordedVideo(null);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
    setIsPlaying(false);
    setRecordedChunks([]);
  };

  const downloadVideo = () => {
    if (recordedVideo) {
      const url = URL.createObjectURL(recordedVideo);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setRecordedVideo(file);
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (mediaStream) {
      const audioTracks = mediaStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !audioEnabled;
      });
    }
  };

  const switchCamera = async () => {
    const newFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(newFacing);
    
    if (mediaStream) {
      cleanup();
      await initializeCamera();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingInstructions = () => {
    switch (recordingType) {
      case 'messaging':
        return {
          title: 'Record Message Video',
          instructions: [
            'Introduce yourself and your school',
            'Explain the benefits of joining the parent portal',
            'Keep it personal and welcoming (2-3 minutes max)',
            'Speak clearly and maintain eye contact with camera'
          ]
        };
      case 'tutorial':
        return {
          title: 'Record Tutorial Video',
          instructions: [
            'Show step-by-step how to use the portal',
            'Demonstrate key features parents will use',
            'Keep explanations simple and clear',
            'Include screen recording if needed'
          ]
        };
      default:
        return {
          title: 'Record Video',
          instructions: [
            'Position yourself in good lighting',
            'Speak clearly towards the camera',
            'Keep the video engaging and informative',
            'Review before finalizing'
          ]
        };
    }
  };

  const instructions = getRecordingInstructions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Video className="text-red-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{instructions.title}</h2>
              <p className="text-sm text-gray-600">Create engaging video content for parents</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-mono text-gray-700">
                {formatTime(recordingTime)}
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Video Area */}
          <div className="flex-1 p-6">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              {cameraError ? (
                <div className="flex flex-col items-center justify-center h-full text-white p-6">
                  <AlertCircle size={48} className="mb-4 text-red-400" />
                  <p className="text-lg font-medium mb-2">Camera Error</p>
                  <p className="text-sm text-gray-300 text-center mb-4">{cameraError}</p>
                  <button
                    onClick={initializeCamera}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry Camera Access
                  </button>
                </div>
              ) : recordedVideo ? (
                <video
                  ref={playbackRef}
                  src={URL.createObjectURL(recordedVideo)}
                  className="w-full h-full object-cover"
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}

              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">
                    {isPaused ? 'PAUSED' : 'REC'}
                  </span>
                </div>
              )}

              {/* Quality Badge */}
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {videoQuality}
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {!recordedVideo ? (
                <>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={cameraError}
                    className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                      isRecording
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isRecording ? (
                      <>
                        <Square size={20} className="mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Camera size={20} className="mr-2" />
                        Start Recording
                      </>
                    )}
                  </button>

                  {isRecording && (
                    <button
                      onClick={pauseRecording}
                      className="flex items-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      {isPaused ? (
                        <>
                          <Play size={20} className="mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause size={20} className="mr-2" />
                          Pause
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={resetRecording}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <RotateCcw size={16} className="mr-2" />
                    Record Again
                  </button>
                  
                  <button
                    onClick={downloadVideo}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Download size={16} className="mr-2" />
                    Download
                  </button>
                </>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="video/*"
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Upload size={16} className="mr-2" />
                Upload Video
              </button>
            </div>

            {/* Advanced Controls */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={toggleAudio}
                className={`p-2 rounded-lg ${audioEnabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                title={audioEnabled ? 'Mute Audio' : 'Enable Audio'}
              >
                {audioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
              </button>

              <button
                onClick={switchCamera}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                title="Switch Camera"
              >
                <RotateCcw size={16} />
              </button>

              <select
                value={videoQuality}
                onChange={(e) => setVideoQuality(e.target.value)}
                className="px-3 py-1 bg-gray-100 border-none rounded-lg text-sm"
              >
                <option value="720p">720p HD</option>
                <option value="1080p">1080p Full HD</option>
              </select>
            </div>
          </div>

          {/* Instructions Panel */}
          <div className="lg:w-80 p-6 bg-gray-50 border-l border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Settings size={18} className="mr-2" />
              Recording Tips
            </h3>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
                <ul className="space-y-2">
                  {instructions.instructions.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full                      flex items-center justify-center text-xs mr-2 mt-0.5">
                        {index + 1}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-medium text-gray-800 mb-2">Technical Setup:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Monitor size={16} className="mr-2 text-gray-500" />
                    Screen recording: {videoQuality}
                  </li>
                  <li className="flex items-center">
                    {audioEnabled ? (
                      <Mic size={16} className="mr-2 text-green-500" />
                    ) : (
                      <MicOff size={16} className="mr-2 text-red-500" />
                    )}
                    Audio: {audioEnabled ? 'Enabled' : 'Disabled'}
                  </li>
                  <li className="flex items-center">
                    <Smartphone size={16} className="mr-2 text-gray-500" />
                    Camera: {cameraFacing === 'user' ? 'Front' : 'Back'}
                  </li>
                </ul>
              </div>

              {recordedVideo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center">
                    <CheckCircle size={16} className="mr-2" />
                    Recording Complete
                  </h4>
                  <p className="text-sm text-green-700">
                    Your video is ready for review. You can download it or record again.
                  </p>
                </div>
              )}

              {cameraError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    Camera Issue
                  </h4>
                  <p className="text-sm text-red-700">
                    {cameraError}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRecordingStudio;