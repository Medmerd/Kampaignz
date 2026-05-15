import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'antd';
import { api } from '../../api';
import { formatDate } from '../../utils/format';
import type { Message, TabOptions } from '../../types';
import MessageModal from './messageModal';

const MessagesTab = ({ campaignId, notify }: TabOptions) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedMessageId, setSelectedMessageId] = useState<number>(-1); 
    const [selectedMessage, setSelectedMessage] = useState<Message>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
   
    const loadData = async () => {
        try {
            const refreshMessages = await api.listMessagesByCampaign(campaignId);
            setMessages(refreshMessages);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load messages', err);
            if (notify) notify('error', 'Failed to load messages', (err as Error).message);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [campaignId]);

    useEffect(() => {
        if (!selectedMessageId || selectedMessageId <= 0) {
            return;
        }
        const selected = messages.find((message) => message.id === selectedMessageId);
        setSelectedMessage(selected || null);
    }, [selectedMessageId, messages]);

    const onCreateMessage = useCallback(() => {
        setSelectedMessageId(-1);
        setSelectedMessage(null);
        setModalOpen(true);
    }, []);

    const onEditMessage = useCallback((messageId: number) => {
        setSelectedMessageId(messageId);
        const selected = messages.find((message) => message.id === messageId);
        setSelectedMessage(selected || null);
        setModalOpen(true);
    }, [messages]);

    const onModalClosed = useCallback(() => {
        setModalOpen(false);
        setSelectedMessage(null);
        setSelectedMessageId(-1);
        loadData();
    }, []);

    if (loading) {
        return (<div>Loading...</div>);
    }

    return (
        <div className="split">
            <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2>Messages</h2>
                    <Button id="new-message-button" className="secondary-button" type="primary" onClick={onCreateMessage}>
                        New message
                    </Button>
                </div>
                
                <ul className="campaign-list" style={{ listStyle: 'none', padding: 0 }}>
                    {messages.map((message) => (
                        <li key={message.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{message.content ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '') : '(empty)'}</div>
                                <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }}>{formatDate(message.created_at)}</div>
                            </div>
                            <Button onClick={() => onEditMessage(message.id)}>Edit</Button>
                        </li>
                    ))}
                </ul>
            </div>

            <MessageModal 
                message={selectedMessage} 
                messageId={selectedMessageId} 
                campaignId={campaignId} 
                isOpen={isModalOpen} 
                onClose={onModalClosed} 
                notify={notify} 
            />
        </div>
    );
}

export default MessagesTab;