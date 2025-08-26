import { UserContext } from "@/app/AppContext";
import { AuthModal } from "./siginModal";
import { useContext, useState, useRef, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import axios from "axios";
import { Input } from "@/components/ui/input";

type Sender = "user" | "ai";
interface Message {
  id: number;
  text: string;
  sender: Sender;
  timestamp: string;
}

const AiModal = () => {
  const { userAuth } = useContext(UserContext);
  const [showChatbot, setShowChatbot] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null); // Add this back
  const csrf_token = userAuth?.csrf_token;
  const auth = userAuth?.access_token ? true : false;
  const access_token = userAuth?.access_token;
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | false>(false); // Better typing

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chatbot opens
useEffect(() => {
  if (showChatbot && inputRef.current) {
    const focusInput = () => inputRef.current?.focus();
    focusInput();
    const interval = setInterval(focusInput, 100);
    return () => clearInterval(interval);
  }
}, [showChatbot]);


const fakeClose = () => {
  const esc = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
  document.dispatchEvent(esc);

};

  const handleReviewFree = async () => {
    setIsLoading(true);
    const documentId = sessionStorage.getItem("documentId");
    try {
      const { data } = await axios.post(
        process.env.NEXT_PUBLIC_SERVER_DOMAIN + `/api/chat/sessions`,
        {
          document_id: documentId,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "X-CSRF-Token": csrf_token,
            "Content-Type": "application/json",
          },
        }
      );
      setIsLoading(false);

      console.log(data.session_id);
      setSessionId(data.session_id);
      setShowChatbot(true);

      // Initial AI greeting message
      const initialMessage: Message = {
        id: Date.now(),
        text: "Hello! I'm AI Torney, your document review assistant. I've analyzed your document and I'm ready to help you with any questions or concerns. What would you like to know about your document?",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([initialMessage]);

    } catch (error: unknown) {
      console.log(error);
      setIsLoading(false);

      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Something went wrong");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleBackToMain = () => {
    setShowChatbot(false);
    setMessages([]);
    setInputValue("");
  };

  const sendMessage = async (e: React.FormEvent) => {
    const documentId = sessionStorage.getItem("documentId");
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Store the message before clearing input
    const messageText = inputValue;

    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue(""); // Clear input immediately
    inputRef.current?.focus();
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        process.env.NEXT_PUBLIC_SERVER_DOMAIN +
          `/api/chat/chatbot/${documentId}`,
        {
          session_id: sessionId,
          message: messageText, // Use stored message, not cleared inputValue
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "X-CSRF-Token": csrf_token,
            "Content-Type": "application/json",
          },
        }
      );

      setIsLoading(false);
      console.log(data.ai_response);
      

      // Add AI response to messages
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: data.ai_response,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMessage]);

    } catch (error: unknown) {
      console.log(error);
      setIsLoading(false);

      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Something went wrong");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const quickQuestions = [
    "Summarize this document in 3 bullet points.",
    "Highlight any unfair clauses (e.g., one-sided termination).",
    "List obligations for both parties with deadlines.",
  ];

  // Chatbot Component
  const ChatbotComponent = () => (
    <div className='w-[300px] md:w-[500px] h-[400px] flex flex-col'>
      {/* Header */}
      <div className='flex items-center gap-3 p-4 border-b bg-gray-50'>
        <button
          onClick={handleBackToMain}
          className='p-1 hover:bg-gray-200 rounded'
        >
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
        </button>
        <div className='flex items-center gap-2'>
          <div>
            <p className='font-bold text-2xl text-black'>AI Torney</p>
          </div>
        </div>
        <div className='ml-auto flex gap-2 p-2 border rounded-full border-[#CBD5E1]'>
          <Image src={"/web.svg"} height={20} width={20} alt='p' />
          <p className='text-sm text-gray-500'>www.torney.cc</p>
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.sender !== "user" && (
              <div className='w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center text-black text-xs sm:text-sm font-semibold mr-2 sm:mr-3 flex-shrink-0'>
                <Image src={"/leaf.svg"} height={20} width={20} alt='AI' />
              </div>
            )}
            <div
              className={`max-w-[80%] ${
                message.sender === "user" ? "order-2" : "order-1"
              }`}
            >
              <div
                className={`p-3 rounded-lg ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                <p className='whitespace-pre-line'>{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === "user"
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className='flex justify-start'>
            <div className='w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0'>
              <Image src={"/leaf.svg"} height={20} width={20} alt='AI' />
            </div>
            <div className='bg-gray-100 rounded-lg rounded-bl-none p-3'>
              <div className='flex space-x-1'>
                <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                <div
                  className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && !isLoading && (
        <div className='px-4 pb-2'>
          <p className='text-xs text-gray-500 mb-2'>Quick questions:</p>
          <div className='flex flex-wrap gap-2'>
            {quickQuestions.map((question, index) => (
              <button
                type='button'
                key={index}
                onClick={() => setInputValue(question)}
                className='text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full border'
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
<form onSubmit={sendMessage} className='p-4 border-t bg-white'>
  <div className='flex gap-2'>
    <Input
      ref={inputRef}
      type='text'
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={(e) => e.stopPropagation()}
      placeholder='Message to AI Torney...'
      disabled={isLoading}
      className='flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
    />
    <button
      type='submit'
      disabled={!inputValue.trim() || isLoading}
      className='px-4 py-2 gap-2 flex bg-[#006FEE] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors'
    >
      <span>Send</span>
      <Image src={"/right.svg"} height={20} width={20} alt='Send' />
    </button>
  </div>
</form>
    </div>
  );

  return (
    <div
       onKeyDown={(e) => e.stopPropagation()}
    onMouseDown={(e) => e.stopPropagation()}
    onTouchStart={(e) => e.stopPropagation()}
    >
      {auth ? (
        <div>
          {showChatbot ? (
            <ChatbotComponent />
          ) : (
            <div className='w-full flex-col space-x-3 space-y-4 p-4 gap-5'>
              <p className='text-xl md:text-2xl text-gray-500'>AI Document Reviewer</p>

              <p>
                Do you want continue with AI Torney to Review your document.
              </p>

              <p className='text-sm text-gray-600'>
                By using you agree to AI Torney
                <span className='text-blue-600 underline px-1'>
                  Terms & Condition
                </span>
                and
                <span className='text-blue-600 px-1 underline'>
                  Privacy Policy
                </span>
                .
              </p>

              <div className='flex justify-end gap-2 mt-2'>
                {/* <button
                  type='button'
                  onClick={fakeClose}
                  className='px-3 py-2 border hover:bg-gray-100 rounded-xl'
                >
                  Cancel
                </button> */}
                <button
                  type='button'
                  onClick={handleReviewFree}
                  disabled={isLoading}
                  className='px-3 py-2 bg-blue-500 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl'
                >
                  {isLoading ? (
                    <svg
                      className='animate-spin h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z'
                      />
                    </svg>
                  ) : (
                    " Review free"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div
            className='flex flex-col gap-1'
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <p className='text-black font-bold'>AI Review</p>
            <span className='font-extralight'>
              <AuthModal />
              Review and get recommendation
            </span>
            <span className='font-extralight'>
              about your document from our AI.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiModal;
