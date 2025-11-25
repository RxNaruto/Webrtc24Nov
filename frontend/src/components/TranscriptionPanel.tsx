import React from 'react';
import { MessageSquare, User, Users, Mic, MicOff } from 'lucide-react';

interface TranscriptionMessage {
  id: string;
  text: string;
  speaker: 'local' | 'remote';
  timestamp: Date;
  isFinal: boolean;
}

interface TranscriptionPanelProps {
  transcriptions: TranscriptionMessage[];
  isListening: boolean;
  onToggleListening: () => void;
}

export const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({
  transcriptions,
  isListening,
  onToggleListening,
}) => {
  return (
    <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">Live Chat</h3>
        </div>
        <button
          onClick={onToggleListening}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            isListening
              ? 'bg-red-600 hover:bg-red-500 text-white flex items-center space-x-1'
              : 'bg-green-600 hover:bg-green-500 text-white flex items-center space-x-1'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-3 h-3" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Mic className="w-3 h-3" />
              <span>Start</span>
            </>
          )}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 max-h-80 pr-2">
        {transcriptions.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Speech will appear as text messages here</p>
          </div>
        ) : (
          transcriptions.map((transcription) => (
            <div
              key={transcription.id}
              className={`flex ${
                transcription.speaker === 'local'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                transcription.speaker === 'local'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-slate-700 text-white rounded-bl-md'
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  {transcription.speaker === 'local' ? (
                    <User className="w-3 h-3" />
                  ) : (
                    <Users className="w-3 h-3" />
                  )}
                  <span className="text-xs opacity-75">
                    {transcription.speaker === 'local' ? 'You' : 'Remote'}
                  </span>
                  <span className="text-xs opacity-50">
                    {transcription.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <p className={`text-sm ${
                  transcription.isFinal ? '' : 'italic opacity-75'
                }`}>
                  {transcription.text}
                  {!transcription.isFinal && <span className="animate-pulse ml-1">...</span>}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};