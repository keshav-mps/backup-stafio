import { useState, useEffect, useCallback, useRef } from "react";
import { Send } from "lucide-react";
import { useParams } from "react-router-dom";
import { chatAPI } from "../services/apiService";
import { getAuthToken } from "../services/tokenManager";

interface Message {
  id: number;
  text: string;
  sender: "recruiter" | "seeker";
  timestamp: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { APPLICATION_ID } = useParams<{ APPLICATION_ID: string }>();
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const applicationId = APPLICATION_ID || "";
  const userId = localStorage.getItem("user_id") || "";
  const roleId = localStorage.getItem("role_id") || "";
  const isRecruiter = roleId === "3";
  
  // Determine recruiter and seeker IDs based on role
  const recruiterId = isRecruiter ? userId : localStorage.getItem("recruiter_id") || "";
  const seekerId = isRecruiter ? localStorage.getItem("seeker_id") || "" : userId;
  
  const WEBSOCKET_URL = `ws://staffio-dev.999r.in:82/ws?token=${localStorage.getItem("token")}`;
  
  const scrollToBottom = useCallback(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom]);

  useEffect(() => {
    const fetchPreviousMessages = async () => {
      try {
        console.log("Fetching previous messages...");
        setIsLoading(true);
        const token = getAuthToken();
        if (!token) {
          console.error("Token not found in localStorage.");
          return;
        }

        const data = await chatAPI.getMessages(recruiterId, seekerId);
        console.log("Fetched previous messages:", data);

        if (data) {
          const previousMessages = data
            .filter((msg: any) => msg.message && msg.sender_id)
            .map((msg: any) => ({
              id: msg.id,
              text: msg.message,
              sender: msg.sender_id.toString() === recruiterId ? "recruiter" : "seeker",
              timestamp: new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }))
            .sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

          setMessages(previousMessages);
        }
      } catch (error) {
        console.error("Error fetching previous messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const setupWebSocket = () => {
      console.log("Setting up WebSocket connection...");
      const newSocket = new WebSocket(WEBSOCKET_URL);

      newSocket.onopen = () => {
        console.log("WebSocket connection established.");
        setIsConnected(true);
        
        // Subscribe to the chat channel
        const subscribeMessage = {
          event: "subscribe",
          channel: `chat.${applicationId}`,
        };
        newSocket.send(JSON.stringify(subscribeMessage));
        console.log("Subscribed to channel:", `chat.${applicationId}`);
      };

      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received:", data);
          
          if (data.event === "message.sent" && data.data && data.data.chat) {
            const chatMessage = data.data.chat;
            
            // Only add the message if it's not from the current user
            const isSenderCurrentUser = 
              (isRecruiter && chatMessage.sender === "recruiter") || 
              (!isRecruiter && chatMessage.sender === "seeker");
              
            if (!isSenderCurrentUser) {
              const newMessage: Message = {
                id: Date.now(),
                text: chatMessage.message,
                sender: chatMessage.sender,
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };
              addMessage(newMessage);
            }
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      newSocket.onclose = () => {
        console.log("WebSocket connection closed.");
        setIsConnected(false);
        
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (socket === newSocket) {
            setupWebSocket();
          }
        }, 3000);
      };

      newSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        newSocket.close();
      };

      setSocket(newSocket);
      
      return () => {
        console.log("Cleaning up WebSocket connection...");
        newSocket.close();
      };
    };

    fetchPreviousMessages();
    const cleanup = setupWebSocket();

    return () => {
      if (cleanup) cleanup();
    };
  }, [applicationId, recruiterId, seekerId, addMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (newMessage.trim() && socket && isConnected) {
      const token = getAuthToken();
      if (!token) return;

      const messageData = {
        sender_id: isRecruiter ? recruiterId : seekerId,
        receiver_id: isRecruiter ? seekerId : recruiterId,
        message: newMessage,
      };

      const newMessageObject: Message = {
        id: Date.now(),
        text: newMessage,
        sender: isRecruiter ? "recruiter" : "seeker",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      try {
        console.log("Sending message to WebSocket:", {
          event: "message.sent",
          data: { chat: messageData },
          channel: `chat.${applicationId}`,
        });

        addMessage(newMessageObject);

        socket.send(
          JSON.stringify({
            event: "message.sent",
            data: { chat: messageData },
            channel: `chat.${applicationId}`,
          })
        );

        const response = await chatAPI.sendMessage(messageData);
        console.log("Message successfully sent to API.");
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== newMessageObject.id));
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <div className="bg-gray-100 p-4 shadow-md">
        <h1 className="text-xl font-semibold">
          Chat with {isRecruiter ? "Candidate" : "Recruiter"}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === (isRecruiter ? "recruiter" : "seeker")
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === (isRecruiter ? "recruiter" : "seeker")
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p className="break-words">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === (isRecruiter ? "recruiter" : "seeker")
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || !isConnected}
            className="bg-blue-500 text-white p-2 rounded-full disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
        {!isConnected && (
          <p className="text-red-500 text-sm mt-2">
            Disconnected. Trying to reconnect...
          </p>
        )}
      </div>
    </div>
  );
};

export default Chat; 