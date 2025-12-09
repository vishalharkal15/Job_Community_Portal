import { useState } from "react";
import { MessageSquare, Send, Paperclip, Search } from "lucide-react";

export default function CompanyChat({ companyProfile }) {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      candidateName: "John Doe",
      position: "React Developer",
      lastMessage: "Thank you for the opportunity!",
      timestamp: "10:30 AM",
      unread: 2,
    },
    {
      id: 2,
      candidateName: "Jane Smith",
      position: "Product Manager",
      lastMessage: "When can I expect to hear back?",
      timestamp: "Yesterday",
      unread: 0,
    },
    {
      id: 3,
      candidateName: "Mike Johnson",
      position: "DevOps Engineer",
      lastMessage: "I have a few questions about the role",
      timestamp: "Dec 7",
      unread: 1,
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "candidate",
      text: "Hi, I wanted to follow up on my application for the React Developer position.",
      timestamp: "10:15 AM",
    },
    {
      id: 2,
      sender: "company",
      text: "Hello! Thank you for reaching out. We've reviewed your application and would like to schedule an interview.",
      timestamp: "10:20 AM",
    },
    {
      id: 3,
      sender: "candidate",
      text: "That's great! When would be convenient for you?",
      timestamp: "10:25 AM",
    },
    {
      id: 4,
      sender: "company",
      text: "How about next Tuesday at 2 PM? We'll send you the meeting link.",
      timestamp: "10:28 AM",
    },
    {
      id: 5,
      sender: "candidate",
      text: "Thank you for the opportunity!",
      timestamp: "10:30 AM",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const templates = [
    "Thank you for your application. We will review it and get back to you soon.",
    "Congratulations! We would like to schedule an interview with you.",
    "Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.",
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: "company",
          text: newMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setNewMessage("");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
        <MessageSquare className="w-8 h-8 text-blue-600" />
        Messages & Chat
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                  selectedConversation?.id === conv.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{conv.candidateName}</h3>
                  {conv.unread > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{conv.position}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-500 truncate">{conv.lastMessage}</p>
                  <span className="text-xs text-gray-400">{conv.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-[600px]">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-gray-100">
                  {selectedConversation.candidateName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedConversation.position}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "company" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender === "company"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "company" ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Templates */}
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick Templates:</div>
                <div className="flex flex-wrap gap-2">
                  {templates.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => setNewMessage(template)}
                      className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full transition"
                    >
                      {template.substring(0, 30)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
