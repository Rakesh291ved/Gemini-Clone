import React, {useState, useContext} from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { Context } from '../../context/ContextDefinition'

const Sidebar = () => { 
    const [extended, setExtended] = useState(false)
    const [activeTab, setActiveTab] = useState('recent') // 'recent' or 'history'
    const { onSent, prevPrompts, setRecentPrompt, newChat, chatHistory, loadChat, clearHistory } = useContext(Context)
    
    const loadPrompt = async (prompt) => {
        if (prompt && typeof prompt === 'string') {
            setRecentPrompt(prompt)
            await onSent(prompt)
        }
    }

    // Format timestamp to readable date
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    return (
        <div className='sidebar'>
            <div className="top">
                <img onClick={() => setExtended(prev=>!prev)} className='menu' src={assets.menu_icon} alt="Menu" />
                <div onClick={()=>newChat()} className="new-chat">
                    <img src={assets.plus_icon} alt="New Chat Icon" />
                    {extended ? <p>New Chat</p>: null}
                </div>
                {extended && (
                    <div className="sidebar-tabs">
                        <div 
                            className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
                            onClick={() => setActiveTab('recent')}
                        >
                            Recent
                        </div>
                        <div 
                            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            History
                        </div>
                    </div>
                )}
                
                {extended && activeTab === 'recent' && prevPrompts && prevPrompts.length > 0 ? (
                    <div className="recent">
                        <p className="recent-title">Recent Prompts</p>
                        {prevPrompts.map((item, i) => {
                            // Skip invalid items
                            if (!item || typeof item !== 'string') return null;
                            
                            return ( 
                                <div key={i} onClick={() => loadPrompt(item)} className="recent-entry">
                                    <img src={assets.message_icon} alt="Message Icon" />
                                    <p>{item.length > 18 ? item.slice(0, 18) + '...' : item}</p>
                                </div>
                            )
                        })}
                    </div>
                ) : null}
                
                {extended && activeTab === 'history' && chatHistory && chatHistory.length > 0 ? (
                    <div className="history">
                        <div className="history-header">
                            <p className="history-title">Chat History</p>
                            <button className="clear-history" onClick={clearHistory}>Clear All</button>
                        </div>
                        <div className="history-list">
                            {chatHistory.map((chat) => (
                                <div key={chat.id} onClick={() => loadChat(chat.id)} className="history-entry">
                                    <div className="history-entry-icon">
                                        {chat.hasImage ? (
                                            <img src={assets.gallery_icon} alt="Image Chat" />
                                        ) : (
                                            <img src={assets.message_icon} alt="Text Chat" />
                                        )}
                                    </div>
                                    <div className="history-entry-content">
                                        <p className="history-entry-prompt">
                                            {chat.prompt.length > 25 ? chat.prompt.slice(0, 25) + '...' : chat.prompt}
                                        </p>
                                        <p className="history-entry-time">{formatDate(chat.timestamp)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
                
                {extended && activeTab === 'history' && (!chatHistory || chatHistory.length === 0) && (
                    <div className="empty-history">
                        <p>No chat history yet</p>
                    </div>
                )}
            </div>
            <div className="bottom">
                <div className="bottom-item recent-entry">
                    <img src={assets.question_icon} alt="Help Icon" />
                    {extended ? <p>Help</p>: null}
                </div>
                <div 
                    className="bottom-item recent-entry"
                    onClick={() => {
                        if (extended) {
                            setActiveTab('history');
                        }
                    }}
                >
                    <img src={assets.history_icon} alt="Activity Icon" />
                    {extended ? <p>Activity</p>: null}
                </div>
                <div className="bottom-item recent-entry">
                    <img src={assets.setting_icon} alt="Settings Icon" />
                    {extended ? <p>Settings</p>: null}
                </div>
            </div>
        </div>
    )
}

export default Sidebar
