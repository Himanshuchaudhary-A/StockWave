import React, { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import connection from '../signalRService'; 
import './Chatbot.css'; 

const Chatbot = () => {
    const [messages, setMessages] = useState<any>([]);
    const [input, setInput] = useState('');
    const chatBoxRef = useRef<any>(null);
    
    useEffect(() => {
        const startConnection = async () => {
            try {
                await connection.start();
                console.log('Connected to SignalR Hub');
            } catch (err) {
                console.error('Error connecting to SignalR Hub:', err);
            }
        };

        // Listen for incoming messages
        const messageHandler = (response) => {
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setMessages((prevMessages) => {
                const isDuplicate = prevMessages.some(msg => msg.text === response && msg.sender === 'bot');
                if (!isDuplicate) {
                    return [...prevMessages, { text: response, sender: 'bot', time: timestamp }];
                }
                return prevMessages;
            });
        };

        const delayConnection = () => {
            const timer = setTimeout(() => {
                connection.on('ReceiveHelpResponse', messageHandler);
                startConnection();
            }, 0); 

            return () => clearTimeout(timer); 
        };

        delayConnection();

        return () => {
            connection.off('ReceiveHelpResponse', messageHandler); // Clean up listener
            const stopConnection = async () => {
                if (connection.state === signalR.HubConnectionState.Connected) {
                    try {
                        await connection.stop();
                        console.log('SignalR disconnected');
                    } catch (err) {
                        console.error('Error while stopping connection: ', err);
                    }
                }
            };
            stopConnection();
        };
    }, []); 

    const handleSendMessage = async () => {
        if (input.trim()) {
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: input, sender: 'user', time: timestamp },
            ]);
    
            // Send user message to the server
            await connection.invoke('HandleUserQuery', input);
            setInput('');
        }
    };

    // Scroll to the bottom of the chat
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="chat-container">
            <div className="chat-box" ref={chatBoxRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        <div className="message-text">{msg.text}</div>
                        <div className="timestamp">{msg.time}</div>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        handleSendMessage();
                    }
                }}
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
    
};

export default Chatbot;
