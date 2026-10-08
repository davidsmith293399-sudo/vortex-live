import React, { useState, useEffect } from 'react';
import { Lobby } from './components/Lobby';
import { Room } from './components/Room';

export default function App() {
  const [inCall, setInCall] = useState(false);
  const [roomId, setRoomId] = useState('hangout-hq');
  const [currentUser, setCurrentUser] = useState(null);

  // Parse URL query parameters if friends click an invite link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const userParam = params.get('name');

    if (roomParam) {
      setRoomId(roomParam);
    }
    if (userParam) {
      setCurrentUser((prev) => ({
        id: `usr_${Date.now()}`,
        name: userParam,
        avatar: null,
      }));
    }
  }, []);

  const handleJoinRoom = ({ userName, roomId: targetRoomId, isAudioMuted, isVideoOff }) => {
    const user = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: userName,
      isAudioMuted,
      isVideoOff,
    };

    setCurrentUser(user);
    setRoomId(targetRoomId);
    setInCall(true);

    // Update URL query parameter without full reload
    const newUrl = `${window.location.pathname}?room=${encodeURIComponent(targetRoomId)}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const handleLeaveRoom = () => {
    setInCall(false);
    // Remove room param from URL
    window.history.pushState({}, '', window.location.pathname);
  };

  return inCall && currentUser ? (
    <Room
      roomId={roomId}
      currentUser={currentUser}
      onLeaveRoom={handleLeaveRoom}
    />
  ) : (
    <Lobby
      onJoinRoom={handleJoinRoom}
      initialRoomId={roomId}
      initialUserName={currentUser?.name || ''}
    />
  );
}
