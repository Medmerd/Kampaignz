import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'antd';
import { api } from '../../api';
import type { Player, TabOptions } from '../../types';
import PlayerModal from './playerModal';

const PlayerTab = ({ campaignId, notify }: TabOptions) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

    const loadData = async () => {
        try {
            const data = await api.listPlayersByCampaign(campaignId);
            setPlayers(data);
        } catch (error) {
            console.error(error);
            if (notify) {
                notify('error', 'Failed to load players', (error as Error).message || String(error));
            }
        }
    };

    useEffect(() => {
        loadData();
    }, [campaignId]);

    const onCreatePlayer = useCallback(() => {
        setSelectedPlayerId(null);
        setIsModalOpen(true);
    }, []);

    const onEditPlayer = useCallback((playerId: number) => {
        setSelectedPlayerId(playerId);
        setIsModalOpen(true);
    }, []);

    const onClose = useCallback(() => {
        setIsModalOpen(false);
        loadData();
    }, []);

    return (
        <div className="split">
            <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2>Players</h2>
                    <Button id="new-player-button" className="secondary-button" type="primary" onClick={onCreatePlayer}>
                        New player
                    </Button>
                </div>

                <ul className="campaign-list" style={{ listStyle: 'none', padding: 0 }}>
                    {players.map((player) => (
                        <li key={player.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{player.playerName}</div>
                                <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }}>{player.army}</div>
                            </div>
                            <Button onClick={() => onEditPlayer(player.id)}>Edit</Button>
                        </li>
                    ))}
                </ul>
            </div>

            <PlayerModal
                playerId={selectedPlayerId}
                campaignId={campaignId}
                isOpen={isModalOpen}
                onClose={onClose}
                notify={notify}
            />
        </div>
    );
}

export default PlayerTab;