import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table } from 'antd';
import { api } from '../../api';
import type { Player, TabOptions } from '../../types';
import PlayerModal from './playerModal';
import AssignRuleModal from './AssignRuleModal';
import ArmyRuleCard from '../../components/ArmyRuleCard';

const PlayerTab = ({ campaignId, notify }: TabOptions) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

    const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
    const [assignPlayerId, setAssignPlayerId] = useState<number | null>(null);
    const [assignArmyRuleId, setAssignArmyRuleId] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        try {
            const data = await api.listPlayersByCampaign(campaignId);
            
            // Fetch rules for all players
            const playersWithRules = await Promise.all(data.map(async (p: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
                const rules = await api.listPlayerRules(p.id);
                return { ...p, playerRules: rules };
            }));

            setPlayers(playersWithRules);
        } catch (error) {
            console.error(error);
            if (notify) {
                notify('error', 'Failed to load players', (error as Error).message || String(error));
            }
        }
    }, [campaignId, notify]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
    }, [loadData]);

    const onAssignRule = useCallback((playerId: number, armyRuleId: number | null) => {
        setAssignPlayerId(playerId);
        setAssignArmyRuleId(armyRuleId);
        setIsAssignModalOpen(true);
    }, []);

    const onAssignClose = useCallback(() => {
        setIsAssignModalOpen(false);
        loadData();
    }, [loadData]);

    const onUnassignRule = useCallback(async (playerRuleId: number) => {
        try {
            await api.unassignRuleFromPlayer(playerRuleId);
            if (notify) notify('success', 'Rule Unassigned', 'The rule was removed from the player.');
            loadData();
        } catch (error) {
            console.error(error);
            if (notify) notify('error', 'Unassign Failed', (error as Error).message);
        }
    }, [notify, loadData]);

    const columns = [
        {
            title: 'Player Name',
            dataIndex: 'playerName',
            key: 'playerName',
            render: (text: string) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
        },
        {
            title: 'Army Rulebook',
            dataIndex: 'army_rule_name',
            key: 'army_rule_name',
            render: (text: string | undefined) => (
                <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{text || 'No Army Selected'}</span>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, record: Player) => (
                <Button onClick={() => onEditPlayer(record.id)}>Edit</Button>
            ),
        },
    ];

    const expandedRowRender = (record: Player) => {
        return (
            <div style={{ padding: '0 24px 16px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0 }}>Assigned Rules</h3>
                    <Button type="dashed" onClick={() => onAssignRule(record.id, record.army_rule_id)}>
                        Assign Rule
                    </Button>
                </div>
                
                {record.playerRules && record.playerRules.length > 0 ? (
                    <div>
                        {record.playerRules.map((pr) => (
                            pr.rule ? (
                                <ArmyRuleCard 
                                    key={pr.id} 
                                    rule={pr.rule}
                                    isNested={true}
                                    onDelete={() => onUnassignRule(pr.id)}
                                />
                            ) : null
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'rgba(0,0,0,0.45)' }}>No rules assigned.</p>
                )}
            </div>
        );
    };

    return (
        <div className="split">
            <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2>Players</h2>
                    <Button id="new-player-button" className="secondary-button" type="primary" onClick={onCreatePlayer}>
                        New player
                    </Button>
                </div>

                <Table 
                    columns={columns} 
                    dataSource={players} 
                    rowKey="id" 
                    expandable={{ expandedRowRender }}
                    pagination={false}
                />
            </div>

            <PlayerModal
                playerId={selectedPlayerId}
                campaignId={campaignId}
                isOpen={isModalOpen}
                onClose={onClose}
                notify={notify}
            />

            <AssignRuleModal
                playerId={assignPlayerId}
                campaignId={campaignId}
                armyRuleId={assignArmyRuleId}
                isOpen={isAssignModalOpen}
                onClose={onAssignClose}
                notify={notify}
            />
        </div>
    );
}

export default PlayerTab;