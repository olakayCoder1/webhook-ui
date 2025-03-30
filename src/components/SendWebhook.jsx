// components/SendWebhook.jsx
import React, { useState } from 'react';
import { useWebhook } from '../context/WebhookContext';

function SendWebhook() {
  const { sendWebhook } = useWebhook();
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('POST');
  const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }]);
  const [bodyContent, setBodyContent] = useState('{\n  "message": "Hello World"\n}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };
  
  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };
  
  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    
    // Convert headers array to object
    const headerObj = {};
    headers.forEach(h => {
      if (h.key.trim()) {
        headerObj[h.key.trim()] = h.value;
      }
    });
    
    try {
      // Parse body if it's JSON
      let parsedBody;
      try {
        parsedBody = JSON.parse(bodyContent);
      } catch (e) {
        parsedBody = bodyContent;
      }
      
      const response = await sendWebhook(url, method, headerObj, parsedBody);
      setResult(response);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to send webhook');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Send Webhook</h1>
        <p className="text-gray-600">Use this form to send a webhook request to any URL.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-6">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            type="url"
            id="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://example.com/webhook"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
            Method
          </label>
          <select
            id="method"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Headers
            </label>
            <button
              type="button"
              onClick={addHeader}
              className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Header
            </button>
          </div>
          
          {headers.map((header, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                className="w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Header name"
                value={header.key}
                onChange={(e) => updateHeader(index, 'key', e.target.value)}
              />
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Header value"
                value={header.value}
                onChange={(e) => updateHeader(index, 'value', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeHeader(index)}
                className="px-2 py-2 text-red-600 hover:text-red-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        
        <div className="mb-6">
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
            Body
          </label>
          <textarea
            id="body"
            rows={10}
            className="font-mono w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={bodyContent}
            onChange={(e) => setBodyContent(e.target.value)}
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Send Webhook'
            )}
          </button>
        </div>
      </form>
      
      {(result || error) && (
        <div className="px-6 pb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Response</h2>
          {error ? (
            <div className="bg-red-50 p-4 rounded-md border border-red-200">
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <div className="flex justify-between items-start">
                <h3 className="text-green-800 font-medium">Success</h3>
                <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  {result.status}
                </span>
              </div>
              <div className="mt-2">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Response Headers</h4>
                <pre className="bg-gray-800 p-3 rounded-md text-xs text-gray-200 overflow-x-auto">
                  {Object.entries(result.headers).map(([key, value]) => (
                    `${key}: ${value}\n`
                  ))}
                </pre>
              </div>
              <div className="mt-2">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Response Body</h4>
                <pre className="bg-gray-800 p-3 rounded-md text-xs text-gray-200 overflow-x-auto">
                  {typeof result.data === 'object' ? JSON.stringify(result.data, null, 2) : result.data}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SendWebhook;