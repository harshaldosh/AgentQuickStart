import React, { useState } from 'react';
import { Video, ExternalLink, Play, AlertCircle, Bot, Mic } from 'lucide-react';

interface ConversationResponse {
  conversation_url: string;
  conversation_id: string;
}

interface ElevenLabsResponse {
  signed_url: string;
}

type Platform = 'tavus' | 'elevenlabs';

function App() {
  const [platform, setPlatform] = useState<Platform>('tavus');
  
  // Tavus fields
  const [apiKey, setApiKey] = useState('');
  const [conversationName, setConversationName] = useState('');
  const [context, setContext] = useState('');
  const [replicaId, setReplicaId] = useState('');
  
  // ElevenLabs fields
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('');
  const [agentId, setAgentId] = useState('');
  
  // Common fields
  const [showEmbedded, setShowEmbedded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationUrl, setConversationUrl] = useState('');

  const createTavusConversation = async (): Promise<ConversationResponse> => {
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        replica_id: replicaId,
        conversation_name: conversationName,
        conversational_context: context || undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
  };

  const createElevenLabsConversation = async (): Promise<string> => {
    const apiUrl = new URL('https://api.elevenlabs.io/v1/convai/conversation/get_signed_url');
    apiUrl.searchParams.set('agent_id', agentId);
    
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'xi-api-key': elevenLabsApiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data: ElevenLabsResponse = await response.json();
    return data.signed_url;
  };

  const handleJoin = async () => {
    setLoading(true);
    setError('');
    
    try {
      let url: string;
      
      if (platform === 'tavus') {
        const conversation = await createTavusConversation();
        url = conversation.conversation_url;
      } else {
        url = await createElevenLabsConversation();
      }
      
      setConversationUrl(url);

      if (showEmbedded) {
        // Keep URL for embedded display
      } else {
        // Open in new tab
        window.open(url, '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
    } finally {
      setLoading(false);
    }
  };

  const isTavusFormValid = apiKey && conversationName && replicaId;
  const isElevenLabsFormValid = elevenLabsApiKey && agentId;
  const isFormValid = platform === 'tavus' ? isTavusFormValid : isElevenLabsFormValid;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center gap-3 mb-8">
            <Video className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">AI Conversation Interface</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Platform
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPlatform('tavus')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-md border transition-colors ${
                      platform === 'tavus'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Video className="w-5 h-5" />
                    Tavus.io
                  </button>
                  <button
                    onClick={() => setPlatform('elevenlabs')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-md border transition-colors ${
                      platform === 'elevenlabs'
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                    ElevenLabs
                  </button>
                </div>
              </div>

              {platform === 'tavus' ? (
                <>
                  <div>
                    <label htmlFor="replicaId" className="block text-sm font-medium text-gray-700 mb-2">
                      Replica ID
                    </label>
                    <input
                      type="text"
                      id="replicaId"
                      value={replicaId}
                      onChange={(e) => setReplicaId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter Tavus.io Replica ID"
                    />
                  </div>

                  <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      id="apiKey"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your Tavus.io API key"
                    />
                  </div>

                  <div>
                    <label htmlFor="conversationName" className="block text-sm font-medium text-gray-700 mb-2">
                      Conversation Name
                    </label>
                    <input
                      type="text"
                      id="conversationName"
                      value={conversationName}
                      onChange={(e) => setConversationName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Name this conversation"
                    />
                  </div>

                  <div>
                    <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
                      Conversational Context
                    </label>
                    <textarea
                      id="context"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Provide context for the conversation (optional)"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="agentId" className="block text-sm font-medium text-gray-700 mb-2">
                      Agent ID
                    </label>
                    <input
                      type="text"
                      id="agentId"
                      value={agentId}
                      onChange={(e) => setAgentId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter ElevenLabs Agent ID"
                    />
                  </div>

                  <div>
                    <label htmlFor="elevenLabsApiKey" className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      id="elevenLabsApiKey"
                      value={elevenLabsApiKey}
                      onChange={(e) => setElevenLabsApiKey(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your ElevenLabs API key"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Display Option
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="videoOption"
                      checked={showEmbedded}
                      onChange={() => setShowEmbedded(true)}
                      className={`w-4 h-4 border-gray-300 focus:ring-2 ${
                        platform === 'tavus' 
                          ? 'text-blue-600 focus:ring-blue-500' 
                          : 'text-green-600 focus:ring-green-500'
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                      {platform === 'tavus' ? <Video className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      Show embedded on this page
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="videoOption"
                      checked={!showEmbedded}
                      onChange={() => setShowEmbedded(false)}
                      className={`w-4 h-4 border-gray-300 focus:ring-2 ${
                        platform === 'tavus' 
                          ? 'text-blue-600 focus:ring-blue-500' 
                          : 'text-green-600 focus:ring-green-500'
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Launch in separate page
                    </span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <button
                onClick={handleJoin}
                disabled={!isFormValid || loading}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-colors ${
                  isFormValid && !loading
                    ? platform === 'tavus'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Play className="w-5 h-5" />
                {loading ? 'Creating Conversation...' : `Join ${platform === 'tavus' ? 'Video' : 'Voice'} Conversation`}
              </button>
            </div>

            <div className="lg:border-l lg:pl-8">
              {conversationUrl && showEmbedded ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {platform === 'tavus' ? 'Video Conversation' : 'Voice Conversation'}
                  </h3>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={conversationUrl}
                      className="w-full h-full border-0"
                      allow="camera; microphone; autoplay"
                      title={`${platform === 'tavus' ? 'Tavus' : 'ElevenLabs'} Conversation`}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    {platform === 'tavus' ? (
                      <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    ) : (
                      <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    )}
                    <p className="text-gray-500">
                      {conversationUrl 
                        ? 'Conversation opened in new tab' 
                        : `${platform === 'tavus' ? 'Video' : 'Voice'} conversation will appear here after joining`
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;