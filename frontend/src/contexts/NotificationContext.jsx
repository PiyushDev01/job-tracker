import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

// Create the context
const NotificationContext = createContext(undefined);

/**
 * Custom hook to use the notification context
 * @returns {Object} Notification context value
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

/**
 * Provider component for the notification context
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const { user } = useAuth();
  // Load notifications from local storage on mount or when user changes
  useEffect(() => {
    if (user) {
      try {
        const storageKey = `notifications_${user.id}`;
        const storedNotifications = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (storedNotifications.length > 0) {
          setNotifications(storedNotifications);
        } else {
          // Clear notifications when switching to a user with no stored notifications
          setNotifications([]);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    } else {
      // Clear notifications when no user is logged in
      setNotifications([]);
    }
  }, [user]);

  // Connect to socket when user is authenticated
  useEffect(() => {
    if (user) {
      // Use the correct URL based on environment
      let socketUrl = 'http://localhost:5000'; // Default fallback
      
      try {
        // More robust URL detection
        if (import.meta.env.VITE_API_URL) {
          // Extract origin from the API URL
          const apiUrl = new URL(import.meta.env.VITE_API_URL);
          socketUrl = apiUrl.origin;
        }
        
        // In production, try to use the same domain if we're on it
        if (window.location.hostname !== 'localhost' && 
            window.location.protocol === 'https:') {
          // If we're on the actual frontend domain in production, use relative URL
          socketUrl = window.location.origin;
        }
      } catch (error) {
        console.error('Error parsing socket URL:', error);
      }
      
      console.log(`Connecting to socket at: ${socketUrl}`);
      setConnectionAttempts(prev => prev + 1);
      
      const newSocket = io(socketUrl, {
        path: '/socket.io', // Explicit path
        auth: {
          token: localStorage.getItem('token'),
          userId: user.id // Send user ID for proper room assignment
        },
        transports: ['polling', 'websocket'], // Try polling first, then upgrade
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        timeout: 20000,
        withCredentials: true,
        forceNew: connectionAttempts > 0, // Force new connection after failures
        autoConnect: true
      });      newSocket.on('notification', (data) => {
        try {
          console.log('Received notification:', data);
          if (data && data.message) {
            addNotification(data.message, data.type || 'info');
          } else {
            console.warn('Received incomplete notification data:', data);
          }
        } catch (error) {
          console.error('Error processing notification:', error);
        }
      });
        newSocket.on('connect', () => {
        console.log('Socket connected with ID:', newSocket.id);
        // Don't add a notification to avoid spamming the user
        console.log('Socket connection established successfully');
      });

      newSocket.on('connected', (data) => {
        console.log('Received server confirmation:', data);
      });

      newSocket.on('pong', (data) => {
        console.log('Received pong from server:', data);
      });

      // Connection error handling
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        // Don't add a notification for each error to avoid notification spam
        console.log(`Connection error: ${error.message}. Will retry automatically.`);
      });

      // For reconnection success
      newSocket.on('reconnect', (attemptNumber) => {
        console.log(`Socket reconnected after ${attemptNumber} attempts`);
      });

      // For reconnection failures
      newSocket.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
      });

      // For disconnections
      newSocket.on('disconnect', (reason) => {
        console.log(`Socket disconnected. Reason: ${reason}`);
        if (reason === 'io server disconnect') {
          // The server has forcefully disconnected the socket
          console.log('Server disconnected the socket, attempting to reconnect...');
          newSocket.connect();
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);
    // More robust ping mechanism
  useEffect(() => {
    if (socket) {
      // Less frequent pings to reduce network traffic
      const pingInterval = setInterval(() => {
        if (socket.connected) {
          console.log('Sending ping to keep socket connection alive');
          
          try {
            // Send ping with timestamp to measure response time
            const pingTime = Date.now();
            socket.emit('ping', { time: pingTime }, () => {
              // Optional callback if ping is acknowledged
              const latency = Date.now() - pingTime;
              console.log(`Ping acknowledged with ${latency}ms latency`);
              setConnectionError(false);
            });
            
            // Set a timeout to detect if ping doesn't get acknowledged
            setTimeout(() => {
              if (socket.connected) {
                console.log('Checking socket health...');
              }
            }, 5000);
          } catch (err) {
            console.error('Error sending ping:', err);
          }
        } else {
          console.log('Socket disconnected, attempting to reconnect');
          setConnectionError(true);
          try {
            socket.connect();
          } catch (err) {
            console.error('Reconnection attempt failed:', err);
          }
        }
      }, 120000); // 2 minutes (reduced frequency)

      return () => clearInterval(pingInterval);
    }
  }, [socket]);

  /**
   * Add a new notification
   * @param {string} message - The notification message
   * @param {string} type - The notification type (info, success, warning, error)
   */
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
    };

    // Add notification to the beginning of the array
    setNotifications(prev => [notification, ...prev]);
    
  // Store notifications in local storage to persist between sessions - using user-specific key
    try {
      if (user) {
        const storageKey = `notifications_${user.id}`;
        const storedNotifications = JSON.parse(localStorage.getItem(storageKey) || '[]');
        localStorage.setItem(storageKey, JSON.stringify([notification, ...storedNotifications].slice(0, 50)));
      }
    } catch (error) {
      console.error('Error storing notifications:', error);
    }
  };
  /**
   * Remove a notification by ID
   * @param {string} id - The notification ID
   */  const removeNotification = (id) => {
    setNotifications(prev => {
      const updatedNotifications = prev.filter(notification => notification.id !== id);
      // Update local storage with user-specific key
      try {
        if (user) {
          const storageKey = `notifications_${user.id}`;
          localStorage.setItem(storageKey, JSON.stringify(updatedNotifications));
        }
      } catch (error) {
        console.error('Error updating notifications in storage:', error);
      }
      return updatedNotifications;
    });
  };

  /**
   * Clear all notifications
   */  const clearNotifications = () => {
    setNotifications([]);
    // Clear notifications in local storage with user-specific key
    try {
      if (user) {
        const storageKey = `notifications_${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error clearing notifications in storage:', error);
    }
  };
  // Context value with connection status 
  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    isConnected: socket ? socket.connected : false,
    connectionError,
    reconnect: () => {
      if (socket) {
        console.log('Manually attempting to reconnect socket');
        try {
          socket.connect();
          return true;
        } catch (err) {
          console.error('Manual reconnection failed:', err);
          return false;
        }
      }
      return false;
    }
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
