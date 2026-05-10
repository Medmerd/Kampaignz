import React, { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { ChangeHandler, SubmitHandler, useForm, Controller } from "react-hook-form";
import { Collapse, Select, Modal, Space } from 'antd';
import type { CollapseProps, SelectProps } from 'antd';
import { api } from '../../api';
import { escapeHtml } from '../../utils/dom';
import { formatDate } from '../../utils/format';
import type { Message, Player, MessageInput, JSONString, messageConfig } from '../../types';

type Options = {
    message: Message,
    messageId: number,
    campaignId: number;
    isOpen: boolean;
    onClose: () => void;
};

const MessageModal = (options: Options) => {
    if (options.isOpen === false) {
        return (<></>);
    }

    const {campaignId, messageId} = options;
    const [selectedCampaignId, setSelectedCampaignId] = useState<number>(campaignId);
    const [selectedMessageId, setSelectedMessageId] = useState<number>(messageId); 
    const [selectedMessage, setSelectedMessage] = useState<Message>();

    const [players, setPlayers] = useState<SelectProps['options']>([]);

    const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const { watch, control, register, reset, handleSubmit } = useForm<Message>({ defaultValues: {
        campaign_id: campaignId,
        id: messageId,
        content: '',
        config: '{}',
        player_ids: [],
       }});

    const loadData = async () => {
        const players = await api.listPlayersByCampaign(options.campaignId)
        const formatted: SelectProps['options'] = [];
        players.forEach((player) =>  formatted.push({label: player.playerName, value: player.id}));
        console.log('players', formatted);

        setPlayers(formatted)
        setSelectedMessage(options.message);
        setSelectedMessageId(options.message ? options.message.id : undefined);
        setLoading(false)

        if (options.message) {
            const {config, content, ...rest} = options.message;
            let configStr = '{}';

            try {
                configStr = config;
            } catch (e) {
                configStr = '{}';
            }

            reset({...rest, config: configStr});
        }
    }

    const saveMessage: (data: Message) => Promise<void> = async (data: Message) => {
        const {content, config, player_ids: playerIds} = data;
        const input: MessageInput = {content, config, playerIds};
        let messageId = selectedMessageId;

        console.log("save", selectedCampaignId, messageId, input);
        if (!messageId || messageId <= 0) {
            const created = await api.createMessage(selectedCampaignId, input);
            messageId = created.id;
            setSelectedMessageId(created.id);
            // status.textContent = 'Message created.';
        } else {
            await api.updateMessage(messageId, input);
            // status.textContent = 'Message updated.';
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedCampaignId, selectedMessageId, selectedMessage]);

    const collapseItems: CollapseProps['items'] = [
        {
            key: '1',
            label: 'Message',
            children:
            <div style={{display: "grid"}}>
                <textarea id="message-content" 
                    name="messageContent" rows={15} 
                    key="messageContent"
                    defaultValue={selectedMessage?.content}
                    {...register('content')}
                    ></textarea>
                <button id="generate-message-button" className="secondary-button" type="button">Generate Message</button>
                <button id="send-message-button" className="secondary-button" type="button">Send to Discord</button>
            </div>,
        },
        {
            key: '2',
            label: 'Config',
            forceRender: true,
            children: 
            <div style={{display: "grid"}}>
                <textarea id="message-config" 
                    name="messageConfig" 
                    key="messageConfig"
                    rows={10} 
                    defaultValue={selectedMessage?.config}
                    {...register('config')}
                    ></textarea>
            </div>,
        },
    ];
    
    /** callbacks */
    const onFormClose: () => void = useCallback(() => {
        options.onClose();
    }, []);
    const onSave: () => void = useCallback(() => {
        handleSubmit(onMessageSubmit);        
    },[]);
    const onMessageSubmit: SubmitHandler<Message> = useCallback((data) => {
        if (saveMessage(data)) {
            onFormClose();
        }
    }, []);

    if (loading) {
        return (<div>Loading...</div>);
    }

    return (
        <Modal
            title="Basic Modal"
            closable={false}
            open={options.isOpen}
            width={'90%'}
            footer={null}>
                <h2>{selectedMessage ? 'Edit message' : 'Create message'}</h2>
                <form id='messageForm' style={{display: 'flex', flexDirection: 'column', flexFlow: 'column wrap'}} className='detailsForm' onSubmit={handleSubmit(onMessageSubmit)}>
                    
                    <Collapse items={collapseItems} defaultActiveKey={1} />
                 
                    <label htmlFor="message-player-ids">Players</label>
                    <Controller name='player_ids' 
                        control={control}
                        
                    
                        render={({ field, fieldState }) => (
                            <Select {...field} 
                            style={{ width: '100%' }}
                            options={players}    
                            mode="multiple"/>
                        )}
                    />
                    <Space style={{padding: '10px 0 0 0'}}>
                        <button type="submit">{selectedMessage ? 'Save message' : 'Create message'}</button>
                        <button id="close-message" type="button" onClick={onFormClose}>Close</button>
                    </Space>
                </form>
        </Modal>
    );
}

export default MessageModal;