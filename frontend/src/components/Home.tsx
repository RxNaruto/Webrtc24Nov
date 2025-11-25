import { Link } from 'react-router-dom';
import { Video, Phone, Users, Zap } from 'lucide-react';

export const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
            <Video className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            DeafEase
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            High-quality peer-to-peer video calling. Connect instantly with crystal clear audio and video.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link
            to="/sender"
            className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 group-hover:bg-blue-500 transition-colors">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Start Call</h3>
            <p className="text-slate-300">
              Initiate a new video call and wait for someone to join
            </p>
          </Link>

          <Link
            to="/receiver"
            className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4 group-hover:bg-green-500 transition-colors">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Join Call</h3>
            <p className="text-slate-300">
              Join an existing video call session
            </p>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <Zap className="w-8 h-8 text-blue-400 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Instant Connection</h4>
            <p className="text-slate-300 text-sm">
              Connect immediately with our optimized WebRTC technology
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <Video className="w-8 h-8 text-green-400 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">HD Quality</h4>
            <p className="text-slate-300 text-sm">
              Crystal clear video and audio for the best calling experience
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <Users className="w-8 h-8 text-purple-400 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Peer-to-Peer</h4>
            <p className="text-slate-300 text-sm">
              Direct connection ensures privacy and low latency
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};