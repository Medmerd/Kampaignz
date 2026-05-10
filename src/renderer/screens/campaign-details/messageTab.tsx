import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';
import { escapeHtml } from '../../utils/dom';
import { formatDate } from '../../utils/format';
import type { Message, Player } from '../../types';
import MessageModal from './messageModal';

type Options = {
    campaignId: number;
};

const MessagesTab = ({
    campaignId
}: Options) => {
    const [selectedCampaignId, setSelectedCampaignId] = useState<number>(campaignId);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedMessageId, setSelectedMessageId] = useState<number>(-1); 
    const [selectedMessage, setSelectedMessage] = useState<Message>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
   
    const loadData = async () => {
        const refreshMessages = await api.listMessagesByCampaign(campaignId);
    
        setMessages(refreshMessages);
        setLoading(false)
    };

    useEffect(() => {
        loadData();
    }, [campaignId, isModalOpen]);

    useEffect(() => {
        if (!selectedMessageId) {
            return
        }
        const selected = messages.find((message) => {
            return message.id === selectedMessageId
        });
        setSelectedMessage(selected);
        console.log( 'MessageTab:UseEffect - ', messages, selected)

    }, [selectedMessageId]);

    const onCreateMessage: () => void = useCallback(() => {
        setSelectedMessageId(-1);
        setSelectedMessage(undefined);
        setModalOpen(true);
    }, []);
    const onEditMessage: (e: React.MouseEvent<HTMLButtonElement>) => void = useCallback((e) => {
        const messageId = parseInt(e.currentTarget.dataset.messageId); 
        console.log('click message id', messageId);
         
        setSelectedMessageId(messageId);
        const selected = messages.find((message) => {
            return message.id === messageId
        });
        setSelectedMessage(selected);
        console.log('selected message from click', selected);
        
        setModalOpen(true);
    }, [messages]);
    const onModalClosed: () => void = useCallback(() => {
        setModalOpen(false);
        setSelectedMessage(null);
        setSelectedMessageId(-1);
        loadData();
    }, [])

    if (loading) {
        return (<div>Loading...</div>);
    }

    return (
        <div className="split">
            <div>
                <h2>Messages</h2>
                <button id="new-message-button" className="secondary-button" type="button" onClick={onCreateMessage}>New message</button>
                <ul id="message-list" className="campaign-list">
                {
                    messages.map((message) => {
                        return (
                            <li key={`row${message.id}`}>
                                <button className={`link-button`} 
                                    data-message-id={message.id}
                                    onClick={onEditMessage}>
                                        {escapeHtml(message.content.slice(0, 42) || '(empty)')}
                                </button>
                                <span className="date">{formatDate(message.created_at)}</span>
                            </li>
                        );
                    })
                }
                </ul>
            </div>

            <MessageModal message={selectedMessage} messageId={selectedMessageId} campaignId={selectedCampaignId} isOpen={isModalOpen} onClose={onModalClosed} />
            
        </div>
    );
}

export default MessagesTab;