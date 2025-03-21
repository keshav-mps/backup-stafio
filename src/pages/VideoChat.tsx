import React, { useState, useEffect, useCallback, useRef } from "react";
import { Send } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { liveKitAPI, chatAPI } from "../services/apiService";
import { getAuthToken } from "../services/tokenManager";

interface Message {
  id: number;
  text: string;
  sender: "recruiter" | "seeker";
  timestamp: string;
}

const VideoChatComponent: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const userId = localStorage.getItem("user_id");
  const roleId = localStorage.getItem("role_id");
  const isRecruiter = roleId === "2";
  const isSeeker = roleId === "3";
  const roomName = `video.${applicationId}`;
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // Direct use of environment variables
  const API_URL = "ws://ws.staffio-dev.999r.in:82/app/imf1bh71rnrbirpmmdsd";
  const serverUrl = import.meta.env.VITE_LIVEKIT_URL;
  
  // Define recruiter and seeker IDs
  const recruiterId = isRecruiter ? userId : applicationId?.split('.')[0];
  const seekerId = isSeeker ? userId : applicationId?.split('.')[1];

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const addMessage = useCallback((message: Message) => {
    setMessages((prevMessages) => {
      const isDuplicate = prevMessages.some((msg) => msg.id === message.id);
      if (isDuplicate) return prevMessages;
      const updatedMessages = [...prevMessages, message];
      updatedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      return updatedMessages;
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchPreviousMessages = async () => {
      try {
        const token = getAuthToken();
        if (!token || !recruiterId || !seekerId) {
          console.error("Missing token or user IDs");
          return;
        }

        const data = await chatAPI.getMessages(recruiterId, seekerId);
        console.log("Fetched messages:", data);
        
        if (data && Array.isArray(data)) {
          const formattedMessages = data.map((msg) => ({
            id: msg.id,
            text: msg.message,
            sender: msg.sender_id.toString() === recruiterId ? "recruiter" : "seeker",
            timestamp: msg.created_at,
          }));
          setMessages(formattedMessages);
          setTimeout(() => scrollToBottom(), 100);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    const setupWebSocket = () => {
      console.log("Connecting to WebSocket at:", API_URL);
      const ws = new WebSocket(API_URL);

      ws.onopen = () => {
        setIsConnected(true);
        const channelName = `chat.${applicationId}`;
        ws.send(
          JSON.stringify({
            event: "pusher:subscribe",
            data: { channel: channelName },
          })
        );
        console.log("WebSocket connection established and subscribed to channel:", channelName);
      };

      ws.onmessage = (event) => {
        try {
          const receivedMessage = JSON.parse(event.data);
          console.log("Received WebSocket message:", receivedMessage);
          if (receivedMessage.event === "pusher:connection_established") return;

          if (receivedMessage.data) {
            const chatMessage = JSON.parse(receivedMessage.data);
            if (chatMessage) {
              const isCurrentUser = chatMessage.sender === (isRecruiter ? "recruiter" : "seeker");
              if (isCurrentUser) return;

              const newMessage: Message = {
                id: chatMessage.id || Date.now(),
                text: chatMessage.message,
                sender: chatMessage.sender,
                timestamp: new Date(chatMessage.timestamp || Date.now()).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };
              console.log("Adding message to state:", newMessage);
              addMessage(newMessage);
            }
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed, attempting to reconnect...");
        setIsConnected(false);
      };

      setSocket(ws);
      return ws;
    };

    if (applicationId && recruiterId && seekerId) {
      fetchPreviousMessages();
      const ws = setupWebSocket();
      return () => {
        ws.close();
      };
    }
  }, [applicationId, addMessage, isRecruiter, recruiterId, seekerId, API_URL]);

  const handleSend = async () => {
    if (!newMessage.trim() || !recruiterId || !seekerId) return;

    const newMessageObject: Message = {
      id: Date.now(),
      text: newMessage,
      sender: isRecruiter ? "recruiter" : "seeker",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessageObject]);
    setNewMessage("");
    setTimeout(() => scrollToBottom(), 100);

    try {
      const messageData = {
        sender_id: isRecruiter ? recruiterId : seekerId,
        receiver_id: isRecruiter ? seekerId : recruiterId,
        message: newMessage,
      };

      const response = await chatAPI.sendMessage(messageData);
      console.log("Message sent:", response);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== newMessageObject.id));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const initializeRoom = async () => {
      if (!applicationId || !userId) {
        setIsLoading(false);
        return;
      }

      const storedToken = getAuthToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        console.log("Creating room with name:", roomName);
        console.log("Using LiveKit URL:", serverUrl);
        console.log("LiveKit API Key:", import.meta.env.VITE_LIVEKIT_API_KEY);
        
        const roomCreated = await createRoom(roomName);
        if (!roomCreated) {
          setIsLoading(false);
          return;
        }

        const generatedToken = await fetchToken(roomName, userId);
        if (!generatedToken) {
          setIsLoading(false);
          return;
        }

        setToken(generatedToken);
      } catch (error) {
        console.error("Error initializing room:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeRoom();
  }, [roomName, userId, applicationId, serverUrl]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!applicationId || !token) {
    return <div>Failed to initialize the room. Please try again.</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1">
        <LiveKitRoom
          video={!!navigator.mediaDevices?.getUserMedia}
          audio={!!navigator.mediaDevices?.getUserMedia}
          token={token}
          serverUrl={serverUrl}
          data-lk-theme="default"
          style={{ height: "50vh" }}
          onConnected={() => console.log("Connected to LiveKit room with server:", serverUrl)}
          onDisconnected={() => console.log("Disconnected from LiveKit room")}
          onError={(error) => console.error("LiveKit error:", error)}
        >
          <MyVideoConference />
          <RoomAudioRenderer />
          <ControlBar />
        </LiveKitRoom>
      </div>
      <div className="flex-1 flex flex-col bg-gray-100">
        <div className={`${isRecruiter ? "bg-green-600" : "bg-blue-600"} text-white p-4 flex items-center`}>
          <div className={`w-10 h-10 rounded-full bg-white ${isRecruiter ? "text-green-600" : "text-blue-600"} flex items-center justify-center font-bold`}>
            {isRecruiter ? "R" : "S"}
          </div>
          <div className="ml-3">
            <div className="font-semibold">{isRecruiter ? "Recruiter" : "Seeker"}</div>
            <div className="text-sm">{isConnected ? "online" : "offline"}</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500">Start Your Conversation...</div>
          ) : (
            messages.map((message) => {
              const isSender = message.sender === (isRecruiter ? "recruiter" : "seeker");
              const messageClass = isSender
                ? isRecruiter
                  ? "bg-green-500 text-white rounded-br-none ml-auto"
                  : "bg-blue-500 text-white rounded-br-none ml-auto"
                : "bg-white rounded-bl-none mr-auto";
              const timestampClass = isSender
                ? isRecruiter
                  ? "text-green-100"
                  : "text-blue-100"
                : "text-gray-500";
              const alignmentClass = isSender ? "justify-end" : "justify-start";

              return (
                <div key={message.id} className={`flex ${alignmentClass}`}>
                  <div className={`max-w-[70%] rounded-lg p-3 ${messageClass}`}>
                    <div className="text-sm">{message.text}</div>
                    <div className={`text-xs mt-1 ${timestampClass}`}>{message.timestamp}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messageEndRef} />
        </div>
        <div className="bg-white p-4 flex items-center space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message"
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:border-green-500 resize-none"
            rows={1}
          />
          <button
            onClick={handleSend}
            className={`${isRecruiter ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"} text-white p-2 rounded-full focus:outline-none disabled:bg-gray-400`}
            disabled={!isConnected}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const MyVideoConference: React.FC = () => {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  console.log("Tracks in video conference:", tracks);

  return (
    <GridLayout tracks={tracks} style={{ height: "calc(50vh - var(--lk-control-bar-height))" }}>
      <ParticipantTile />
    </GridLayout>
  );
};

const createRoom = async (roomName: string): Promise<boolean> => {
  try {
    const storedToken = getAuthToken();
    if (!storedToken) return false;

    const responseData = await liveKitAPI.createRoom(roomName);
    console.log("Room created successfully:", responseData);
    return true;
  } catch (error) {
    console.error("Error creating room:", error);
    return false;
  }
};

const fetchToken = async (roomName: string, userId: string): Promise<string | null> => {
  try {
    const storedToken = getAuthToken();
    if (!storedToken) return null;
    
    console.log("Fetching token for room:", roomName, "and user:", userId);
    console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);
    
    const data = await liveKitAPI.getToken(roomName, userId);
    return data.token;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
};

export default VideoChatComponent; 