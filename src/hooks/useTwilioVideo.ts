import { useState, useEffect, useRef } from 'react';
import Video from 'twilio-video';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

interface UseTwilioVideoProps {
  appointmentId: string;
  userName: string;
  userRole: 'doctor' | 'patient';
}

export const useTwilioVideo = ({ appointmentId, userName, userRole }: UseTwilioVideoProps) => {
  const [room, setRoom] = useState<Video.Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Video.RemoteParticipant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const connectToRoom = async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    try {
      // Get Twilio token from edge function
      const { data, error } = await supabase.functions.invoke('create-video-room', {
        body: { appointmentId, userName, userRole }
      });

      if (error) throw error;

      const { token, roomName } = data;

      // Connect to Twilio Video Room
      const videoRoom = await Video.connect(token, {
        name: roomName,
        audio: true,
        video: { width: 1280, height: 720 }
      });

      setRoom(videoRoom);
      setIsConnected(true);

      // Attach local video track
      if (localVideoRef.current) {
        const localTrack = Array.from(videoRoom.localParticipant.videoTracks.values())[0];
        if (localTrack?.track) {
          localVideoRef.current.appendChild(localTrack.track.attach());
        }
      }

      // Handle existing participants
      videoRoom.participants.forEach(handleParticipant);

      // Handle new participants
      videoRoom.on('participantConnected', handleParticipant);
      videoRoom.on('participantDisconnected', (participant) => {
        setParticipants(prev => prev.filter(p => p.sid !== participant.sid));
      });

      toast({
        title: 'Connected',
        description: 'You have joined the video call',
      });

    } catch (error: any) {
      console.error('Error connecting to video room:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Could not connect to video call',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleParticipant = (participant: Video.RemoteParticipant) => {
    setParticipants(prev => [...prev, participant]);

    const attachTrack = (track: Video.VideoTrack | Video.AudioTrack) => {
      if (track.kind === 'video' && remoteVideoRef.current) {
        const element = track.attach();
        remoteVideoRef.current.appendChild(element);
      } else if (track.kind === 'audio') {
        track.attach();
      }
    };

    participant.tracks.forEach(publication => {
      if (publication.track && publication.track.kind !== 'data') {
        attachTrack(publication.track as Video.VideoTrack | Video.AudioTrack);
      }
    });

    participant.on('trackSubscribed', (track) => {
      if (track.kind !== 'data') {
        attachTrack(track as Video.VideoTrack | Video.AudioTrack);
      }
    });
  };

  const toggleMute = () => {
    if (!room) return;
    const enabled = !isMuted;
    room.localParticipant.audioTracks.forEach(publication => {
      publication.track.enable(enabled);
    });
    setIsMuted(!enabled);
  };

  const toggleVideo = () => {
    if (!room) return;
    const enabled = !isVideoOff;
    room.localParticipant.videoTracks.forEach(publication => {
      publication.track.enable(enabled);
    });
    setIsVideoOff(!enabled);
  };

  const disconnectFromRoom = () => {
    if (room) {
      room.disconnect();
      setRoom(null);
      setIsConnected(false);
      setParticipants([]);
      
      // Clean up video elements
      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = '';
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.innerHTML = '';
      }

      toast({
        title: 'Disconnected',
        description: 'You have left the video call',
      });
    }
  };

  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  return {
    connectToRoom,
    disconnectFromRoom,
    toggleMute,
    toggleVideo,
    isConnecting,
    isConnected,
    isMuted,
    isVideoOff,
    participants,
    localVideoRef,
    remoteVideoRef,
  };
};
