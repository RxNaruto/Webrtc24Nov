import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface VideoControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isConnected: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
}) => {
  return (
    <div className="flex items-center justify-center space-x-4 p-6 bg-black/30 backdrop-blur-lg rounded-2xl">
      <button
        onClick={onToggleAudio}
        className={`p-4 rounded-full transition-all duration-200 ${
          isAudioEnabled
            ? 'bg-slate-700 hover:bg-slate-600 text-white'
            : 'bg-red-600 hover:bg-red-500 text-white'
        }`}
      >
        {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
      </button>

      <button
        onClick={onToggleVideo}
        className={`p-4 rounded-full transition-all duration-200 ${
          isVideoEnabled
            ? 'bg-slate-700 hover:bg-slate-600 text-white'
            : 'bg-red-600 hover:bg-red-500 text-white'
        }`}
      >
        {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
      </button>

      <button
        onClick={onEndCall}
        className="p-4 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all duration-200 hover:scale-105"
      >
        <PhoneOff className="w-6 h-6" />
      </button>
    </div>
  );
};