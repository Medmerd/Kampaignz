import React, { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { Modal, Space, Button } from 'antd';
import { api } from '../../api';
import type { Player, PlayerInput, PlayerModalOptions } from '../../types';

const PlayerModal = (options: PlayerModalOptions) => {
    const { campaignId, playerId, isOpen, onClose, notify } = options;
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    const { register, reset, handleSubmit } = useForm<PlayerInput>({
        defaultValues: {
            playerName: '',
            army: '',
            notes: '',
            config: '{}',
        }
    });

    const loadData = async () => {
        if (!isOpen) return;

        try {
            if (playerId) {
                // We fetch all players and find the specific one. 
                // Alternatively, we could add `getPlayer` to API, but this is fast enough.
                const players = await api.listPlayersByCampaign(campaignId);
                const player = players.find(p => p.id === playerId);
                if (player) {
                    setSelectedPlayer(player);
                    reset({
                        playerName: player.playerName,
                        army: player.army,
                        notes: player.notes || '',
                        config: player.config ? JSON.stringify(player.config, null, 2) : '{}',
                    });
                }
            } else {
                setSelectedPlayer(null);
                reset({
                    playerName: '',
                    army: '',
                    notes: '',
                    config: '{}',
                });
            }
        } catch (error) {
            console.error('Error loading player data:', error);
            if (notify) notify('error', 'Failed to load player details', (error as Error).message);
        }
    };

    useEffect(() => {
        loadData();
    }, [isOpen, playerId, campaignId]);

    const onFormClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const onSubmit: SubmitHandler<PlayerInput> = useCallback(async (data) => {
        try {
            // Format config if necessary
            // let parsedConfig = {};
            // try {
            //     parsedConfig = JSON.parse(data.config as unknown as string);
            // } catch (e) {
            //     console.warn('Config is not valid JSON, saving as empty object', e);
            // }

            const input: PlayerInput = {
                ...data,
                config: data.config
            };

            if (!playerId) {
                await api.createPlayer(campaignId, input);
                if (notify) notify('success', 'Player created', 'Player added successfully');
            } else {
                await api.updatePlayer(playerId, input);
                if (notify) notify('success', 'Player updated', 'Player updated successfully');
            }

            onFormClose();
        } catch (error) {
            console.error('Error saving player:', error);
            if (notify) notify('error', 'Error saving player', (error as Error).message);
        }
    }, [playerId, campaignId, notify, onFormClose]);

    return (
        <Modal
            title={selectedPlayer ? 'Edit player' : 'Create player'}
            closable={false}
            onCancel={onFormClose}
            open={isOpen}
            width={520}
            footer={null}
        >
            <form id='playerForm' className='detailsForm' onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <label htmlFor="player-name">Player name</label>
                <input id="player-name" type="text" required {...register('playerName')} />

                <label htmlFor="player-army">Army</label>
                <input id="player-army" type="text" required {...register('army')} />

                <label htmlFor="player-notes">Notes</label>
                <textarea id="player-notes" rows={4} {...register('notes')}></textarea>

                <label htmlFor="player-config">Config (JSON object)</label>
                <textarea id="player-config" rows={4} {...register('config')}></textarea>

                <Space style={{ padding: '10px 0 0 0', justifyContent: 'flex-start', width: '100%' }}>
                    <Button type="primary" htmlType="submit">
                        {selectedPlayer ? 'Save player' : 'Create player'}
                    </Button>
                    <Button type="default" onClick={onFormClose}>Cancel</Button>
                </Space>
            </form>
        </Modal>
    );
};

export default PlayerModal;
