import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SIGNALING_URL || (
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5001'
);

export function useSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected' | 'reconnecting'
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log(`[Socket] Initializing connection to ${SOCKET_SERVER_URL}`);
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[Socket Connected] Socket ID: ${socket.id}`);
      setIsConnected(true);
      setConnectionStatus('connected');
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.warn(`[Socket Disconnected] Reason: ${reason}`);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error(`[Socket Connection Error]:`, err.message);
      setError(err.message);
      setConnectionStatus('reconnecting');
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`[Socket Reconnected] after ${attemptNumber} attempts`);
      setIsConnected(true);
      setConnectionStatus('connected');
    });

    socket.on('reconnecting', (attemptNumber) => {
      console.log(`[Socket Reconnecting] Attempt #${attemptNumber}`);
      setConnectionStatus('reconnecting');
    });

    return () => {
      console.log('[Socket] Cleaning up connection');
      socket.disconnect();
    };
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`[Socket Emit Failed] Socket not connected for event "${event}"`);
    }
  }, []);

  const on = useCallback((event, callback) => {
    if (!socketRef.current) return () => {};
    socketRef.current.on(event, callback);
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connectionStatus,
    error,
    emit,
    on,
  };
}
