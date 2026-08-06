import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socketTarget = import.meta.env.DEV ? '/' : API_URL;
    const newSocket = io(socketTarget, {
      transports: ['polling', 'websocket']
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.emit('join:room', user._id);

      const handleNewNotification = (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
      };

      socket.on('notification:new', handleNewNotification);

      return () => {
        socket.off('notification:new', handleNewNotification);
      };
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
