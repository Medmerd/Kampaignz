import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { Modal, Space, Button, Select, Typography, Divider, Row, Col } from 'antd';
import { api } from '../../api';
import type { Session, SessionInput, SessionModalOptions, Player, SessionMatch } from '../../types';

type MatchType = 1 | 2 | 4;

const SessionModal = (options: SessionModalOptions) => {
    const { campaignId, sessionId, isOpen, onClose, notify } = options;
    
    const [players, setPlayers] = useState<Player[]>([]);
    const [draftMatches, setDraftMatches] = useState<SessionMatch[]>([]);
    
    // Match Builder State
    const [matchType, setMatchType] = useState<MatchType>(1);
    const [teamA, setTeamA] = useState<number[]>([]);
    const [teamB, setTeamB] = useState<number[]>([]);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);

    const { register, reset, handleSubmit } = useForm<SessionInput>({ 
        defaultValues: {
            title: '',
            sessionDetails: '',
            map: '',
            config: '{}',
        }
    });

    const loadData = async () => {
        if (!isOpen) return;

        try {
            const fetchedPlayers = await api.listPlayersByCampaign(campaignId);
            setPlayers(fetchedPlayers);

            if (sessionId) {
                // Wait for both to load
                const [sessionDataList, matchData] = await Promise.all([
                    api.listSessionsByCampaign(campaignId),
                    api.listSessionMatches(sessionId)
                ]);
                
                const sessionData = sessionDataList.find(s => s.id === sessionId);

                if (sessionData) {
                    setSelectedSession(sessionData);
                    reset({
                        title: sessionData.title,
                        sessionDetails: sessionData.sessionDetails,
                        map: sessionData.map,
                        config: sessionData.config || '{}',
                    });
                }
                if (matchData) {
                    // Normalize MatchType just in case
                    const normalizedMatches = matchData.map(m => ({
                        ...m,
                        matchType: Number(m.matchType) as MatchType
                    }));
                    setDraftMatches(normalizedMatches);
                }
            } else {
                setSelectedSession(null);
                setDraftMatches([]);
                reset({
                    title: '',
                    sessionDetails: '',
                    map: '',
                    config: '{}',
                });
            }
        } catch (error) {
            console.error('Error loading session data:', error);
            if (notify) notify('error', 'Failed to load session details', (error as Error).message);
        }
    };

    useEffect(() => {
        loadData();
    }, [isOpen, sessionId, campaignId]);

    // Computed states for Match Builder
    const usedPlayerIds = useMemo(() => {
        const used = new Set<number>();
        draftMatches.forEach(match => {
            match.teamAPlayerIds.forEach(id => used.add(id));
            match.teamBPlayerIds.forEach(id => used.add(id));
        });
        return used;
    }, [draftMatches]);

    const availablePlayers = useMemo(() => {
        return players.filter(player => !usedPlayerIds.has(player.id));
    }, [players, usedPlayerIds]);

    const playerOptions = useMemo(() => {
        return availablePlayers.map(p => ({ value: p.id, label: `${p.playerName} (${p.army})` }));
    }, [availablePlayers]);

    const generateMatches = useCallback(() => {
        const teamSize = matchType;
        const playersPerMatch = teamSize * 2;
        const matchCount = Math.floor(availablePlayers.length / playersPerMatch);

        if (matchCount === 0) {
            if (notify) notify('warning', 'Not enough unmatched players for this match type.');
            return;
        }

        const newMatches: SessionMatch[] = [];
        for (let i = 0; i < matchCount; i++) {
            const baseIndex = i * playersPerMatch;
            const teamAPlayerIds = availablePlayers.slice(baseIndex, baseIndex + teamSize).map(p => p.id);
            const teamBPlayerIds = availablePlayers.slice(baseIndex + teamSize, baseIndex + playersPerMatch).map(p => p.id);
            newMatches.push({ matchType, teamAPlayerIds, teamBPlayerIds });
        }

        setDraftMatches(prev => [...prev, ...newMatches]);
        if (notify) notify('success', `Generated ${matchCount} matches.`);
    }, [matchType, availablePlayers, notify]);

    const addManualMatch = useCallback(() => {
        const teamSize = matchType;
        if (teamA.length !== teamSize || teamB.length !== teamSize) {
            if (notify) notify('warning', `Select exactly ${teamSize} players per team for ${matchType}v${matchType}.`);
            return;
        }

        const combined = [...teamA, ...teamB];
        if (new Set(combined).size !== combined.length) {
            if (notify) notify('warning', 'A player cannot be selected more than once in a match.');
            return;
        }

        const duplicate = combined.find(id => usedPlayerIds.has(id));
        if (duplicate) {
            if (notify) notify('warning', 'A player cannot be selected more than once in this session.');
            return;
        }

        setDraftMatches(prev => [...prev, { matchType, teamAPlayerIds: teamA, teamBPlayerIds: teamB }]);
        setTeamA([]);
        setTeamB([]);
        if (notify) notify('success', 'Match added manually.');
    }, [matchType, teamA, teamB, usedPlayerIds, notify]);

    const removeMatch = useCallback((indexToRemove: number) => {
        setDraftMatches(prev => prev.filter((_, idx) => idx !== indexToRemove));
    }, []);

    const onFormClose = useCallback(() => {
        onClose();
        setTeamA([]);
        setTeamB([]);
    }, [onClose]);

    const onSubmit: SubmitHandler<SessionInput> = useCallback(async (data) => {
        try {
            let currentSessionId = sessionId;
            if (!currentSessionId) {
                const created = await api.createSession(campaignId, data);
                currentSessionId = created.id;
                if (notify) notify('success', 'Session created successfully');
            } else {
                await api.updateSession(currentSessionId, data);
                if (notify) notify('success', 'Session updated successfully');
            }

            // Save matches
            if (currentSessionId) {
                await api.replaceSessionMatches(currentSessionId, draftMatches);
            }

            onFormClose();
        } catch (error) {
            console.error('Error saving session:', error);
            if (notify) notify('error', 'Error saving session', (error as Error).message);
        }
    }, [sessionId, campaignId, draftMatches, notify, onFormClose]);

    return (
        <Modal
            title={selectedSession ? 'Edit session' : 'Create session'}
            closable={false}
            onCancel={onFormClose}
            open={isOpen}
            width={720}
            footer={null}
        >
            <form id='sessionForm' className='detailsForm' onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <label htmlFor="session-title">Title</label>
                <input id="session-title" type="text" required {...register('title')} />

                <Row gutter={24}>
                    <Col span={12}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label htmlFor="session-details">Session details</label>
                            <textarea id="session-details" rows={4} {...register('sessionDetails')}></textarea>
                            
                            <label htmlFor="session-map" style={{ marginTop: 12 }}>Map</label>
                            <textarea id="session-map" rows={3} {...register('map')}></textarea>
                            
                            <label htmlFor="session-config" style={{ marginTop: 12 }}>Config (JSON object)</label>
                            <textarea id="session-config" rows={4} {...register('config')}></textarea>
                        </div>
                    </Col>
                    
                    <Col span={12}>
                        <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
                            <Typography.Title level={4} style={{ marginTop: 0 }}>Match builder</Typography.Title>
                            
                            <div id="session-match-builder-controls" style={{ display: availablePlayers.length > 0 ? 'flex' : 'none', flexDirection: 'column', gap: 8 }}>
                                <label htmlFor="session-match-type">Match type</label>
                                <Select 
                                    id="session-match-type" 
                                    value={matchType} 
                                    onChange={(v) => setMatchType(v as MatchType)}
                                    options={[
                                        { value: 1, label: '1 vs 1' },
                                        { value: 2, label: '2 vs 2' },
                                        { value: 4, label: '4 vs 4' }
                                    ]}
                                />
                                
                                <Button type="primary" ghost onClick={generateMatches}>Generate Matches</Button>
                                
                                <Divider style={{ margin: '12px 0' }} />
                                
                                <label htmlFor="session-match-team-a">Team A players</label>
                                <Select 
                                    mode="multiple" 
                                    options={playerOptions}
                                    value={teamA}
                                    onChange={setTeamA}
                                />
                                
                                <label htmlFor="session-match-team-b">Team B players</label>
                                <Select 
                                    mode="multiple" 
                                    options={playerOptions}
                                    value={teamB}
                                    onChange={setTeamB}
                                />
                                
                                <Button onClick={addManualMatch}>Add match</Button>
                            </div>

                            <Divider style={{ margin: '16px 0', display: availablePlayers.length > 0 ? 'block' : 'none' }} />
                            
                            <Typography.Text strong>Current Matches</Typography.Text>
                            <ul className="campaign-list" style={{ marginBottom: 16, padding: 0, listStyle: 'none' }}>
                                {draftMatches.length === 0 ? (
                                    <li style={{ padding: '8px 0', color: 'rgba(0,0,0,0.45)' }}>No matches defined</li>
                                ) : (
                                    draftMatches.map((match, index) => {
                                        const toName = (id: number) => players.find(p => p.id === id)?.playerName || `#${id}`;
                                        const teamANames = match.teamAPlayerIds.map(toName).join(', ');
                                        const teamBNames = match.teamBPlayerIds.map(toName).join(', ');
                                        return (
                                            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                                <div>
                                                    <Typography.Text type="secondary">{match.matchType}v{match.matchType}: </Typography.Text>
                                                    {teamANames} <Typography.Text strong>vs</Typography.Text> {teamBNames}
                                                </div>
                                                <Button type="text" danger size="small" onClick={() => removeMatch(index)}>Remove</Button>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>

                            <Typography.Text strong>Unmatched players</Typography.Text>
                            <ul className="campaign-list" style={{ padding: 0, listStyle: 'none' }}>
                                {availablePlayers.length === 0 ? (
                                    <li style={{ padding: '8px 0', color: 'rgba(0,0,0,0.45)' }}>All players assigned</li>
                                ) : (
                                    availablePlayers.map((player) => (
                                        <li key={player.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                            <Typography.Text>{player.playerName}</Typography.Text>
                                            <Typography.Text type="secondary">{player.army}</Typography.Text>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </Col>
                </Row>

                <Space style={{ padding: '10px 0 0 0', justifyContent: 'flex-start', width: '100%' }}>
                    <Button type="primary" htmlType="submit">
                        {selectedSession ? 'Save session' : 'Create session'}
                    </Button>
                    <Button type="default" onClick={onFormClose}>Cancel</Button>
                </Space>
            </form>
        </Modal>
    )
}

export default SessionModal;