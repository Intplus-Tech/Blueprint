import { UserContext } from "@/app/AppContext";
import { AuthModal } from "./siginModal";
import { useContext, useState, useRef, useEffect } from "react";
import Image from "next/image";
type Sender = "user" | "ai";
interface Message {
  id: number; // You’re using Date.now(), so it's a number
  text: string;
  sender: Sender; // restrict to valid values
  timestamp: string; // from toLocaleTimeString()
}
const AiModal = () => {
  const { userAuth } = useContext(UserContext);
  const [showChatbot, setShowChatbot] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const auth = userAuth?.access_token ? true : false;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleReviewFree = () => {
    setShowChatbot(true);
    // Initial AI greeting message
    const initialMessage : Message = {
      id: Date.now(),
      text: "Hello! I'm AI Torney, your document review assistant. I've analyzed your document and I'm ready to help you with any questions or concerns. What would you like to know about your document?",
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages([initialMessage]);
  };

  const handleBackToMain = () => {
    setShowChatbot(false);
    setMessages([]);
    setInputValue("");
  };

  const handleSendMessage = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage:Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      const aiMessage:Message = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput:string) => {
    const input = userInput.toLowerCase();

    if (input.includes("summary") || input.includes("overview")) {
      return "Based on my analysis, your document appears to be well-structured with an overall score of 85/100. I found 3 minor issues and have 5 recommendations for improvement. Would you like me to elaborate on any specific aspect?";
    } else if (input.includes("issue") || input.includes("problem")) {
      return "I identified these issues in your document:\n\n1. Section 3.2 could benefit from more specific terms\n2. Payment terms need more detail\n3. One clause may need clarification for better enforceability\n\nWould you like me to explain any of these in detail?";
    } else if (input.includes("recommend") || input.includes("suggest")) {
      return "Here are my key recommendations:\n\n• Add specific deadlines in the payment section\n• Include force majeure clause\n• Clarify dispute resolution process\n• Add confidentiality provisions\n• Consider adding termination conditions\n\nShall I provide more details on implementing any of these?";
    } else if (input.includes("legal") || input.includes("law")) {
      return "From a legal perspective, your document generally follows standard practices. However, I recommend having it reviewed by a licensed attorney in your jurisdiction, as I can provide guidance but not legal advice. Is there a specific legal concern you'd like me to address?";
    } else if (input.includes("thank") || input.includes("thanks")) {
      return "You're welcome! I'm here to help with any other questions about your document. Feel free to ask about specific clauses, legal implications, or improvement suggestions.";
    } else {
      return "I understand your question about the document. Based on my analysis, I can provide specific insights about clauses, terms, potential risks, and improvement opportunities. Could you be more specific about what aspect you'd like me to focus on? For example, you could ask about:\n\n• Contract terms and conditions\n• Potential legal issues\n• Recommendations for improvement\n• Specific sections or clauses";
    }
  };

  const quickQuestions = [
    "Summarize this document in 3 bullet points.",
    "Highlight any unfair clauses (e.g., one-sided termination).",
    "List obligations for both parties with deadlines.",
  ];

  // Chatbot Component
  const ChatbotComponent = () => (
    <div className='w-[500px] h-[400px] flex flex-col'>
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
          <p className='text-sm text-gray-500'>www.torney.cc</p>{" "}
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
              <div className='w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-grey flex items-center justify-center text-black text-xs sm:text-sm font-semibold mr-2 sm:mr-3 flex-shrink-0  bg-blue-500 '>
                <Image src={"/leaf.svg"} height={20} width={20} alt='p' />
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

        {isTyping && (
          <div className='flex justify-start'>
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
      {messages.length === 1 && (
        <div className='px-4 pb-2'>
          <p className='text-xs text-gray-500 mb-2'>Quick questions:</p>
          <div className='flex flex-wrap gap-2'>
            {quickQuestions.map((question, index) => (
              <button
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
      <form onSubmit={handleSendMessage} className='p-4 border-t bg-white'>
        <div className='flex gap-2'>
          <input
            type='text'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder='Message to AI Torney...'
            className='flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            disabled={isTyping}
          />
          <button
            type='submit'
            disabled={!inputValue.trim() || isTyping}
            className='px-4 py-2 gap-2 flex bg-[#006FEE] hover:bg-blue-600  text-white rounded-lg transition-colors'
          >
            <span>Send</span>
            <Image src={"/right.svg"} height={20} width={20} alt='p' />
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div>
      {auth ? (
        <div>
          {showChatbot ? (
            <ChatbotComponent />
          ) : (
            <div className='w-full flex-col space-x-3 space-y-4 p-4 gap-5'>
              <p className='text-2xl text-gray-500 '>AI Document Reviewer</p>

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
                <button
                  type='button'
                  className='px-3 py-2 border hover:bg-gray-100 rounded-xl'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={handleReviewFree}
                  className='px-3 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-xl'
                >
                  Review free
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
