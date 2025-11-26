// src/components/Sender.tsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { VideoControls } from "./VideoControl";
import { ConnectionStatus } from "./ConnectedStatus";
import { TranscriptionPanel } from "./TranscriptionPanel";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

interface TranscriptionMessage {
    id: string;
    text: string;
    speaker: 'local' | 'remote';
    timestamp: Date;
    isFinal: boolean;
}

const SIGN_SERVER_URL = "wss://webrtc2way.rithkchaudharytechnologies.xyz/capstone";
// wss://webrtc2way.rithkchaudharytechnologies.xyz/ws/
const SIGNALING_SERVER_URL = "wss://webrtc2way.rithkchaudharytechnologies.xyz/ws/"; // local node server

export const Sender = () => {
    const [socket, setSocket] = useState<null | WebSocket>(null);
    const [signSocket, setSignSocket] = useState<null | WebSocket>(null);

    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
    const [isCallStarted, setIsCallStarted] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [participantCount, setParticipantCount] = useState(1);
    const [transcriptions, setTranscriptions] = useState<TranscriptionMessage[]>([]);
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
    const currentInterimRef = useRef<string>('');

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    const frameIntervalRef = useRef<number | null>(null);

    const [signPrediction, setSignPrediction] = useState<string>("");
    const [signConfidence, setSignConfidence] = useState<number>(0);

    const handleTranscription = (text: string, isFinal: boolean) => {
        const now = new Date();
        const id = `${now.getTime()}-local`;

        if (isFinal) {
            if (socket) {
                socket.send(JSON.stringify({
                    type: 'transcription',
                    text,
                    isFinal: true,
                    target: 'receiver'
                }));
            }
            setTranscriptions(prev => {
                const filtered = prev.filter(t => t.id !== `interim-local`);
                return [...filtered, { id, text, speaker: 'local', timestamp: now, isFinal: true }];
            });
            currentInterimRef.current = '';
        } else {
            if (text !== currentInterimRef.current) {
                currentInterimRef.current = text;
                setTranscriptions(prev => {
                    const filtered = prev.filter(t => t.id !== `interim-local`);
                    return [...filtered, { id: `interim-local`, text, speaker: 'local', timestamp: now, isFinal: false }];
                });
            }
        }
    };

    const { isListening, isSupported, toggleListening } = useSpeechRecognition({
        onTranscription: handleTranscription,
        isEnabled: isSpeechEnabled && isCallStarted
    });

    useEffect(() => {
        const ws = new WebSocket(SIGNALING_SERVER_URL);
        ws.onopen = () => { ws.send(JSON.stringify({ type: 'sender' })); setConnectionStatus('connected'); };
        ws.onclose = () => setConnectionStatus('disconnected');
        ws.onerror = () => setConnectionStatus('disconnected');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'transcription') {
                const now = new Date();
                const id = `${now.getTime()}-remote`;
                if (data.isFinal) {
                    setTranscriptions(prev => {
                        const filtered = prev.filter(t => t.id !== `interim-remote`);
                        return [...filtered, { id, text: data.text, speaker:'remote', timestamp: now, isFinal:true }];
                    });
                } else {
                    setTranscriptions(prev => {
                        const filtered = prev.filter(t => t.id !== `interim-remote`);
                        return [...filtered, { id: `interim-remote`, text: data.text, speaker:'remote', timestamp: now, isFinal:false }];
                    });
                }
            }
        };
        setSocket(ws);

        const signWs = new WebSocket(SIGN_SERVER_URL);
        signWs.onopen = () => console.log("Connected to sign server");
        signWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'prediction') {
                setSignPrediction(data.label);
                setSignConfidence(data.confidence);
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'signPrediction',
                        label: data.label,
                        confidence: data.confidence,
                        target: 'receiver'
                    }));
                }
            }
        };
        signWs.onerror = (e) => console.error('Sign WS error', e);
        setSignSocket(signWs);

        return () => {
            ws.close();
            signWs.close();
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            if (frameIntervalRef.current) window.clearInterval(frameIntervalRef.current);
        };
    }, []);

    async function startSendingVideo() {
        if (!socket) return;
        setIsCallStarted(true);
        setConnectionStatus('connecting');

        try {
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    {
                        urls: 'turn:myturnserver.rithkchaudharytechnologies.xyz:3478',
                        username: 'rithkturnserver',
                        credential: '8570'
                    }
                ]
            });
            peerConnectionRef.current = pc;

            pc.onicecandidate = (e) => {
                if (e.candidate) {
                    socket.send(JSON.stringify({ type: 'iceCandidate', candidate: e.candidate, target: 'receiver' }));
                }
            };

            pc.ontrack = (e) => {
                if (remoteVideoRef.current) { remoteVideoRef.current.srcObject = e.streams[0]; setParticipantCount(2); }
            };

            socket.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'createOffer') {
                    await pc.setRemoteDescription(data.sdp);
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.send(JSON.stringify({ type: 'createAnswer', sdp: pc.localDescription, target: 'receiver' }));
                } else if (data.type === 'createAnswer') {
                    await pc.setRemoteDescription(data.sdp);
                    setConnectionStatus('connected');
                } else if (data.type === 'iceCandidate') {
                    await pc.addIceCandidate(data.candidate);
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.send(JSON.stringify({ type: 'createOffer', sdp: pc.localDescription, target: 'receiver' }));
        } catch (err) {
            console.error('startSendingVideo error', err);
            setConnectionStatus('disconnected');
        }
    }

    const startSignRecognition = () => {
        if (!signSocket || signSocket.readyState !== WebSocket.OPEN) return;
        if (!localVideoRef.current) return;
        signSocket.send(JSON.stringify({ type: 'start' }));

        const video = localVideoRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        frameIntervalRef.current = window.setInterval(() => {
            if (!ctx || video.readyState < 2) return;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (!blob) return;
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    signSocket.send(JSON.stringify({ type:'frame', image: base64 }));
                };
                reader.readAsDataURL(blob);
            }, 'image/jpeg', 0.6);
        }, 120);
    };

    const stopSignRecognition = () => {
        if (frameIntervalRef.current) { window.clearInterval(frameIntervalRef.current); frameIntervalRef.current = null; }
        if (signSocket && signSocket.readyState === WebSocket.OPEN) signSocket.send(JSON.stringify({ type:'stop' }));
    };

    const toggleAudio = () => {
        if (streamRef.current) {
            const track = streamRef.current.getAudioTracks()[0];
            if (track) { track.enabled = !track.enabled; setIsAudioEnabled(track.enabled); }
        }
    };

    const toggleVideo = () => {
        if (streamRef.current) {
            const track = streamRef.current.getVideoTracks()[0];
            if (track) { track.enabled = !track.enabled; setIsVideoEnabled(track.enabled); }
        }
    };

    const endCall = () => {
        stopSignRecognition();
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (peerConnectionRef.current) peerConnectionRef.current.close();
        setIsCallStarted(false);
        setConnectionStatus('disconnected');
        setParticipantCount(1);
        setTranscriptions([]);
        setIsSpeechEnabled(false);
        setSignPrediction("");
        setSignConfidence(0);
    };

    const handleToggleSpeech = () => {
        if (!isSupported) { alert('Speech recognition not supported'); return; }
        setIsSpeechEnabled(!isSpeechEnabled);
        if (!isSpeechEnabled) toggleListening();
    };

    return (
        <div className="min-h-screen p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Link to="/" className="inline-flex items-center space-x-2 text-white hover:text-blue-400">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Home</span>
                </Link>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-white">
                        <Users className="w-5 h-5" />
                        <span>{participantCount}/2</span>
                    </div>
                    <ConnectionStatus status={connectionStatus} role="sender" />
                </div>
            </div>

            {!isCallStarted ? (
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center max-w-md">
                        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Ready to Host</h2>
                        <p className="text-slate-300 mb-8">Click the button below to start your video call and wait for someone to join.</p>
                        <button onClick={startSendingVideo} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold">Start Video Call</button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-120px)]">
                    <div className="lg:col-span-2 relative bg-slate-800 rounded-2xl overflow-hidden">
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        {participantCount === 1 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                <div className="text-center">
                                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-300 text-lg">Waiting for participant...</p>
                                </div>
                            </div>
                        )}
                        <div className="absolute top-4 right-4 w-48 h-36 bg-slate-900 rounded-lg overflow-hidden border-2 border-white/20">
                            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                            <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">You</div>
                        </div>
                        {signPrediction && (
                            <div className="absolute bottom-4 left-4 bg-black/60 px-4 py-2 rounded-lg text-white text-lg">
                                <b>{signPrediction}</b> ({(signConfidence * 100).toFixed(1)}%)
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2 flex flex-col space-y-4">
                        <div className="flex-shrink-0">
                            <VideoControls isAudioEnabled={isAudioEnabled} isVideoEnabled={isVideoEnabled} isConnected={connectionStatus === 'connected'} onToggleAudio={toggleAudio} onToggleVideo={toggleVideo} onEndCall={endCall} />
                            <div className="flex space-x-3 mt-4">
                                <button onClick={startSignRecognition} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg">Start Sign Recognition</button>
                                <button onClick={stopSignRecognition} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg">Stop Recognition</button>
                            </div>
                        </div>

                        {isCallStarted && (
                            <div className="flex-1 min-h-0">
                                <div className="mb-4">
                                    <button onClick={handleToggleSpeech} disabled={!isSupported} className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${isSpeechEnabled ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-slate-600 hover:bg-slate-500 text-white'} ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}>{isSpeechEnabled ? 'Live Chat: ON' : 'Enable Live Chat'}</button>
                                    {!isSupported && <p className="text-xs text-red-400 mt-1 text-center">Speech recognition not supported in this browser</p>}
                                </div>

                                {isSpeechEnabled && (
                                    <TranscriptionPanel transcriptions={transcriptions} isListening={isListening} onToggleListening={toggleListening} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};