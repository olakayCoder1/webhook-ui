// import React, { createContext, useState, useEffect, useContext } from 'react';
// import axios from 'axios';

// const WebhookContext = createContext();

// export function useWebhook() {
//   return useContext(WebhookContext);
// }

// export function WebhookProvider({ children }) {
//   const [webhooks, setWebhooks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userUrl, setUserUrl] = useState('');
  
//   useEffect(() => {
//     // Generate or retrieve user unique URL
//     const getUniqueUrl = async () => {
//       try {
//         const response = await axios.get('/api/url');
//         setUserUrl(response.data.url);
//       } catch (error) {
//         console.error('Error fetching unique URL:', error);
//       }
//     };
    
//     // Fetch initial webhooks
//     const fetchWebhooks = async () => {
//       try {
//         const response = await axios.get('/api/webhooks');
//         setWebhooks(response.data);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching webhooks:', error);
//         setLoading(false);
//       }
//     };
    
//     getUniqueUrl();
//     fetchWebhooks();
    
//     // Set up WebSocket connection for real-time updates
//     const socket = new WebSocket(`ws://${window.location.host}/ws`);
    
//     socket.onmessage = (event) => {
//       const newWebhook = JSON.parse(event.data);
//       setWebhooks(prev => [newWebhook, ...prev]);
//     };
    
//     return () => {
//       socket.close();
//     };
//   }, []);
  
//   const deleteWebhook = async (id) => {
//     try {
//       await axios.delete(`/api/webhooks/${id}`);
//       setWebhooks(webhooks.filter(webhook => webhook.id !== id));
//     } catch (error) {
//       console.error('Error deleting webhook:', error);
//     }
//   };
  
//   const clearWebhooks = async () => {
//     try {
//       await axios.delete('/api/webhooks');
//       setWebhooks([]);
//     } catch (error) {
//       console.error('Error clearing webhooks:', error);
//     }
//   };
  
//   const sendWebhook = async (url, method, headers, body) => {
//     try {
//       const response = await axios.post('/api/send', { url, method, headers, body });
//       return response.data;
//     } catch (error) {
//       console.error('Error sending webhook:', error);
//       throw error;
//     }
//   };
  
//   const value = {
//     webhooks,
//     loading,
//     userUrl,
//     deleteWebhook,
//     clearWebhooks,
//     sendWebhook
//   };
  
//   return (
//     <WebhookContext.Provider value={value}>
//       {children}
//     </WebhookContext.Provider>
//   );
// }


import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../axiosConfig';

const WebhookContext = createContext();

export function useWebhook() {
  return useContext(WebhookContext);
}

export function WebhookProvider({ children }) {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userUrl, setUserUrl] = useState('');
  
  // useEffect(() => {
  //   // Generate or retrieve user unique URL
  //   const getUniqueUrl = async () => {
  //     try {
  //       const response = await axiosInstance.get('/url'); // using configured axios instance
  //       setUserUrl(response.data.url);
  //     } catch (error) {
  //       console.error('Error fetching unique URL:', error);
  //     }
  //   };
    
  //   // Fetch initial webhooks
  //   const fetchWebhooks = async () => {
  //     try {
  //       const response = await axiosInstance.get('/webhooks'); // using configured axios instance
  //       setWebhooks(response.data);
  //       setLoading(false);
  //     } catch (error) {
  //       console.error('Error fetching webhooks:', error);
  //       setLoading(false);
  //     }
  //   };
    
  //   getUniqueUrl();
  //   fetchWebhooks();
    
  //   // Set up WebSocket connection for real-time updates
  //   const socket = new WebSocket(`ws://${window.location.host}/ws`);
    
  //   socket.onmessage = (event) => {
  //     const newWebhook = JSON.parse(event.data);
  //     setWebhooks(prev => [newWebhook, ...prev]);
  //   };
    
  //   return () => {
  //     socket.close();
  //   };
  // }, []);
  useEffect(() => {
    // Generate or retrieve user unique URL
    const getUniqueUrl = async () => {
      try {
        const response = await axiosInstance.get('/url');
        setUserUrl(response.data.url);
      } catch (error) {
        console.error('Error fetching unique URL:', error);
      }
    };

    // Fetch initial webhooks
    const fetchWebhooks = async () => {
      try {
        const response = await axiosInstance.get('/webhooks');
        setWebhooks(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching webhooks:', error);
        setLoading(false);
      }
    };

    // Polling to check for new webhooks
    const intervalId = setInterval(async () => {
      try {
        const response = await axiosInstance.get('/webhooks');
        setWebhooks(response.data);
      } catch (error) {
        console.error('Error fetching webhooks:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Fetch initial data and start polling
    getUniqueUrl();
    fetchWebhooks();

    return () => {
      clearInterval(intervalId); // Clean up the polling interval on unmount
    };
  }, []);
  
  const deleteWebhook = async (id) => {
    try {
      await axiosInstance.delete(`/webhooks/${id}`); // using configured axios instance
      setWebhooks(webhooks.filter(webhook => webhook.id !== id));
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };
  
  const clearWebhooks = async () => {
    try {
      await axiosInstance.delete('/webhooks'); // using configured axios instance
      setWebhooks([]);
    } catch (error) {
      console.error('Error clearing webhooks:', error);
    }
  };
  
  const sendWebhook = async (url, method, headers, body) => {
    try {
      const response = await axiosInstance.post('/send', { url, method, headers, body }); // using configured axios instance
      return response.data;
    } catch (error) {
      console.error('Error sending webhook:', error);
      throw error;
    }
  };
  
  const value = {
    webhooks,
    loading,
    userUrl,
    deleteWebhook,
    clearWebhooks,
    sendWebhook
  };
  
  return (
    <WebhookContext.Provider value={value}>
      {children}
    </WebhookContext.Provider>
  );
}
