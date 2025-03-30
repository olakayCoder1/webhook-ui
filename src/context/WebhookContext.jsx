import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../axiosConfig';

const WebhookContext = createContext();

export function useWebhook() {
  return useContext(WebhookContext);
}

export function WebhookProvider({ children }) {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userUrl, setUserUrl] = useState(
    localStorage.getItem('userUrl') || ''
  );
  const [userId, setUserId] = useState(
    localStorage.getItem('userId') || ''
  );
  
  useEffect(() => {
    // Generate or retrieve user unique URL and ID
    const initializeUser = async () => {
      try {
        // Generate a client ID if not already stored
        let clientId = localStorage.getItem('userId');
        // Pass the client ID to ensure consistent URL assignment
        const response = await axiosInstance.get('/url', {
          headers: { 'X-Client-ID': clientId }
        });
        
        setUserUrl(response.data.url);
        setUserId(response.data.clientId);
        localStorage.setItem('userUrl', response.data.url);
        localStorage.setItem('userId', response.data.clientId);
      } catch (error) {
        console.error('Error initializing user:', error);
      }
    };

    // Fetch initial webhooks with user ID
    const fetchWebhooks = async () => {
      try {
        const response = await axiosInstance.get('/webhooks', {
          params: { userId: userId },
          headers: { 'X-Client-ID': userId }
        });
        setWebhooks(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching webhooks:', error);
        setLoading(false);
      }
    };

    if (!userId || !userUrl) {
      initializeUser().then(() => fetchWebhooks());
    } else {
      fetchWebhooks();
    }




    // Fallback polling mechanism
    const intervalId = setInterval(async () => {
      if (userId) {
        try {
          const response = await axiosInstance.get('/webhooks', {
            params: { userId },
            headers: { 'X-Client-ID': userId }
          });
          setWebhooks(response.data);
        } catch (error) {
          console.error('Error polling webhooks:', error);
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [userId]);
  
  const deleteWebhook = async (id) => {
    try {
      await axiosInstance.delete(`/webhooks/${id}`, {
        params: { userId },
        headers: { 'X-Client-ID': userId }
      });
      setWebhooks(webhooks.filter(webhook => webhook.id !== id));
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };
  
  const clearWebhooks = async () => {
    try {
      await axiosInstance.delete('/webhooks', {
        params: { userId },
        headers: { 'X-Client-ID': userId }
      });
      setWebhooks([]);
    } catch (error) {
      console.error('Error clearing webhooks:', error);
    }
  };
  
  const sendWebhook = async (url, method, headers, body) => {
    try {
      const response = await axiosInstance.post('/send', 
        { url, method, headers, body },
        { headers: { 'X-Client-ID': userId } }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending webhook:', error);
      throw error;
    }
  };
  
  // Add a function to reset user data (for logout functionality)
  const resetUser = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userUrl');
    setUserId('');
    setUserUrl('');
    setWebhooks([]);
    
    // Generate a new user
    const newUserId = `client-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('userId', newUserId);
    setUserId(newUserId);
  };
  
  const value = {
    webhooks,
    loading,
    userUrl,
    userId,
    deleteWebhook,
    clearWebhooks,
    sendWebhook,
    resetUser,
    userId
  };
  
  return (
    <WebhookContext.Provider value={value}>
      {children}
    </WebhookContext.Provider>
  );
}