import { useState, useEffect } from "react";
import run from "../config/gemini";
import { Context } from "./ContextDefinition";

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentprompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");
    const [chatHistory, setChatHistory] = useState([]);

    // Load chat history from sessionStorage on initial render
    // sessionStorage is automatically cleared when the browser is closed
    useEffect(() => {
        try {
            const savedHistory = sessionStorage.getItem('geminiChatHistory');
            const savedPrompts = sessionStorage.getItem('geminiPrevPrompts');
            
            if (savedHistory) {
                setChatHistory(JSON.parse(savedHistory));
            }
            
            if (savedPrompts) {
                setPrevPrompts(JSON.parse(savedPrompts));
            }
        } catch (error) {
            console.error('Error loading chat history from sessionStorage:', error);
        }
    }, []);

    // Save chat history to sessionStorage whenever it changes
    useEffect(() => {
        try {
            if (chatHistory.length > 0) {
                sessionStorage.setItem('geminiChatHistory', JSON.stringify(chatHistory));
            }
        } catch (error) {
            console.error('Error saving chat history to sessionStorage:', error);
        }
    }, [chatHistory]);

    // Save previous prompts to sessionStorage whenever they change
    useEffect(() => {
        try {
            if (prevPrompts.length > 0) {
                sessionStorage.setItem('geminiPrevPrompts', JSON.stringify(prevPrompts));
            }
        } catch (error) {
            console.error('Error saving previous prompts to sessionStorage:', error);
        }
    }, [prevPrompts]);

    // Add event listener for beforeunload to clear data when app closes
    useEffect(() => {
        const handleBeforeUnload = () => {
            // Clear sessionStorage when the app is closed
            sessionStorage.removeItem('geminiChatHistory');
            sessionStorage.removeItem('geminiPrevPrompts');
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const delayPara = (index, nextWord) => {
        setTimeout(function () {
            setResultData((prev) => prev + nextWord);
        }, 10 * index);
    };

    const newChat = () => {
        setLoading(false);
        setShowResult(false);
        setResultData("");
        setInput("");
    };

    const onSent = async (prompt, imageData = null) => {
        setResultData("");
        setLoading(true);
        setShowResult(true);
        let response;
        let currentPrompt = prompt || "";

        try {
            // Start a timer to measure response time
            const startTime = performance.now();
            
            // Create a prompt description that includes image info if present
            let promptDescription = currentPrompt;
            if (imageData) {
                promptDescription = currentPrompt 
                    ? `${currentPrompt} (with image)` 
                    : "Image analysis";
            }
            
            // Always save the prompt to recent prompts if it's not empty
            if (promptDescription.trim()) {
                // Check if this prompt is already in the list to avoid duplicates
                if (!prevPrompts.includes(promptDescription)) {
                    setPrevPrompts((prev) => [...prev, promptDescription]);
                }
                setRecentPrompt(promptDescription);
            } else if (!imageData) {
                // If no valid prompt or image, don't proceed
                setLoading(false);
                setShowResult(false);
                return;
            }
            
            // Send the prompt to the API with image if available
            response = await run(currentPrompt, imageData);
            
            // Check if response contains an error message
            if (response.startsWith("Error:")) {
                setResultData(response);
                console.error(response);
            } else {
                // Format the response for better readability (simplified for speed)
                let formattedResponse = response
                    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                    .replace(/\n/g, '<br>');
                
                // Calculate time taken for API response
                const apiResponseTime = performance.now() - startTime;
                console.log(`API response time: ${apiResponseTime.toFixed(2)}ms`);
                
                // For long responses, skip the typing effect
                if (formattedResponse.length > 500) {
                    setResultData(formattedResponse);
                } else {
                    // For shorter responses, use the typing effect
                    const chars = formattedResponse.split('');
                    for (let i = 0; i < chars.length; i++) {
                        delayPara(i, chars[i]);
                    }
                }
                
                // Save the conversation to chat history
                const newChatEntry = {
                    id: Date.now(),
                    prompt: promptDescription,
                    response: formattedResponse,
                    timestamp: new Date().toISOString(),
                    hasImage: !!imageData
                };
                
                setChatHistory(prev => [...prev, newChatEntry]);
            }
            
            setInput("");
        } catch (error) {
            console.error("Error in onSent:", error);
            setResultData("Sorry, I encountered an error processing your request. Please check the console for details.");
        } finally {
            setLoading(false);
        }
    };
    
    // Load a specific chat from history
    const loadChat = (chatId) => {
        const chat = chatHistory.find(c => c.id === chatId);
        if (chat) {
            setRecentPrompt(chat.prompt);
            setResultData(chat.response);
            setShowResult(true);
        }
    };
    
    // Clear all chat history
    const clearHistory = () => {
        setChatHistory([]);
        setPrevPrompts([]);
        sessionStorage.removeItem('geminiChatHistory');
        sessionStorage.removeItem('geminiPrevPrompts');
        newChat();
    };
    
    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        setRecentPrompt,
        recentprompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat,
        chatHistory,
        loadChat,
        clearHistory
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
}

export default ContextProvider;