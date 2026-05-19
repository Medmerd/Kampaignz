import React, { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Select, Modal, Space, Button } from 'antd';
import type { SelectProps } from 'antd';
import { api } from '../../api';
import type { Message, MessageInput, NotifyFunction } from '../../types';

type Options = {
    message: Message | null;
    messageId: number;
    campaignId: number;
    isOpen: boolean;
    onClose: () => void;
    notify?: NotifyFunction;
};

const MessageModal = (options: Options) => {
    const { campaignId, messageId, isOpen, onClose, notify, message } = options;
    const [players, setPlayers] = useState<SelectProps['options']>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const { control, register, reset, handleSubmit } = useForm<Message>({
        defaultValues: {
            campaign_id: campaignId,
            id: messageId,
            content: '',
            config: '{}',
            player_ids: [],
        }
    });

    const loadData = async () => {
        if (!isOpen) return;

        try {
            const playerList = await api.listPlayersByCampaign(campaignId);
            const formatted = playerList.map(player => ({ label: player.playerName, value: player.id }));
            setPlayers(formatted);
            
            if (message) {
                const { config, ...rest } = message;
                let configStr = '{}';
                try {
                    configStr = config || '{}';
                } catch (e) {
                    configStr = '{}';
                }
                reset({ ...rest, config: configStr });
            } else {
                reset({
                    campaign_id: campaignId,
                    id: -1,
                    content: '',
                    config: '{}',
                    player_ids: [],
                });
            }
        } catch (error) {
            console.error('Failed to load message modal data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [isOpen, campaignId, messageId, message]);

    const onSubmit: SubmitHandler<Message> = useCallback(async (data) => {
        const { content, config, player_ids: playerIds } = data;
        const input: MessageInput = { content, config, playerIds };

        try {
            if (!messageId || messageId <= 0) {
                await api.createMessage(campaignId, input);
                if (notify) notify('success', 'Message created', 'The message was created successfully.');
            } else {
                await api.updateMessage(messageId, input);
                if (notify) notify('success', 'Message updated', 'The message was updated successfully.');
            }
            onClose();
        } catch (error) {
            console.error('Error saving message:', error);
            if (notify) notify('error', 'Error saving message', (error as Error).message || String(error));
        }
    }, [campaignId, messageId, notify, onClose]);

    if (loading && isOpen) {
        return null;
    }

    return (
        <Modal
            title={messageId && messageId > 0 ? 'Edit message' : 'Create message'}
            closable={false}
            onCancel={onClose}
            open={isOpen}
            width={720}
            footer={null}
        >
            <form id='messageForm' className='detailsForm' onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <label htmlFor="message-content">Message Content</label>
                <textarea 
                    id="message-content" 
                    rows={8} 
                    {...register('content')}
                />

                <label htmlFor="message-player-ids">Associated Players</label>
                <Controller 
                    name='player_ids' 
                    control={control}
                    render={({ field }) => (
                        <Select 
                            {...field} 
                            id="message-player-ids"
                            style={{ width: '100%' }}
                            options={players}    
                            mode="multiple"
                        />
                    )}
                />

                <label htmlFor="message-config">Config (JSON object)</label>
                <textarea 
                    id="message-config" 
                    rows={4} 
                    {...register('config')}
                />

                <Space style={{ padding: '10px 0 0 0', justifyContent: 'flex-start', width: '100%' }}>
                    <Button type="primary" htmlType="submit">
                        {messageId && messageId > 0 ? 'Save message' : 'Create message'}
                    </Button>
                    <Button type="default" onClick={onClose}>Cancel</Button>
                    <Button type="primary" ghost>Generate Message</Button>
                    <Button type="primary" ghost>Send to Discord</Button>
                </Space>
            </form>
        </Modal>
    );
};

export default MessageModal;