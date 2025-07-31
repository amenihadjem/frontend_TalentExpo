import io from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';

const SOCKET_URL = 'https://eventii.me/';

export const useChatSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [session, setSession] = useState(null);
  const [agentReplyChunk, setAgentReplyChunk] = useState('');
  const [agentReplyEnd, setAgentReplyEnd] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 3,
      randomizationFactor: 0.5,
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setError(null);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      setSession(null);
      setError(`Disconnected: ${reason}`);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setError(`Connection error: ${err.message}`);
    });

    socketRef.current.on('exception', (data) => {
      console.error('WebSocket exception:', data);
      setError(`Server exception: ${JSON.stringify(data)}`);
    });

    socketRef.current.on('session_created', (newSession) => {
      console.log('Session created:', newSession);
      setSession(newSession);
    });

    socketRef.current.on('agent_reply', (chunk) => {
      setAgentReplyChunk(chunk);
    });

    socketRef.current.on('agent_reply_end', (data) => {
      console.log('Agent reply end:', data);
      setAgentReplyEnd(data);
      if (data.error) {
        setError(`Agent reply error: ${data.error.message || JSON.stringify(data.error)}`);
      }
    });

    socketRef.current.on('chat_history', (messages) => {
      console.log('Chat history received:', messages);
      setChatHistory(messages);
    });

    socketRef.current.on('session_ended', (data) => {
      console.log('Session ended:', data);
      setSession(null);
      setChatHistory([]);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message, err.data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const emitEvent = (eventName, payload) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(eventName, payload);
      setError(null);
    } else {
      console.warn('Socket not connected. Cannot emit event:', eventName, payload);
      setError('Socket not connected. Please log in to chat.');
    }
  };

  const createSession = () => {
    emitEvent('create_session');
  };

  const sendMessage = (payload) => {
    emitEvent('send_message', payload);
  };

  const getChatHistory = (payload) => {
    emitEvent('get_chat_history', payload);
  };

  const endSession = (payload) => {
    emitEvent('end_session', payload);
  };

  return {
    socket: socketRef.current,
    isConnected,
    session,
    agentReplyChunk,
    agentReplyEnd,
    chatHistory,
    error,
    createSession,
    sendMessage,
    getChatHistory,
    endSession,
    setAgentReplyChunk,
    setAgentReplyEnd,
    setChatHistory,
  };
};
