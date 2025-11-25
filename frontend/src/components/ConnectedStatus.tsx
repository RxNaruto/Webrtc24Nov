import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected';
  role: 'sender' | 'receiver';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status, role }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connecting':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          text: 'Connecting...',
          bgColor: 'bg-yellow-600',
          textColor: 'text-yellow-100',
        };
      case 'connected':
        return {
          icon: <Wifi className="w-5 h-5" />,
          text: 'Connected',
          bgColor: 'bg-green-600',
          textColor: 'text-green-100',
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="w-5 h-5" />,
          text: 'Disconnected',
          bgColor: 'bg-red-600',
          textColor: 'text-red-100',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${config.bgColor}`}>
      {config.icon}
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.text} as {role === 'sender' ? 'Host' : 'Guest'}
      </span>
    </div>
  );
};