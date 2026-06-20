import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { Modal, Space, Button, Select, Typography, Divider, Row, Col } from 'antd';
import MapCanvas from '../../components/map/MapCanvas';
import { api } from '../../api';
import type { 
    Mission, 
    MissionInput, 
    MissionModalOptions, 
    Player, 
    MissionMatch 
} from '../../types';

type MatchType = 1 | 2 | 4;

const MissionModal = (options: MissionModalOptions) => {
    const { campaignId, missionId, isOpen, onClose, notify } = options;
    
    const [players, setPlayers] = useState<Player[]>([]);
    const [draftMatches, setDraftMatches] = useState<MissionMatch[]>([]);
    
    // Match Builder State
    const [matchType, setMatchType] = useState<MatchType>(1);
    const [teamA, setTeamA] = useState<number[]>([]);
    const [teamB, setTeamB] = useState<number[]>([]);
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [mapBuilderOpen, setMapBuilderOpen] = useState(false);

    const { register, reset, handleSubmit, setValue, getValues, watch } = useForm<MissionInput>({ 
        defaultValues: {
            title: '',
            missionDetails: '',
            map: '',
            config: '{}',
        }
    });

    const currentMap = watch('map');

    const loadData = async () => {
        if (!isOpen) return;

        try {
            const fetchedPlayers = await api.listPlayersByCampaign(campaignId);
            setPlayers(fetchedPlayers);

            if (missionId) {
                // Wait for both to load
                const [missionDataList, matchData] = await Promise.all([
                    api.listMissionsByCampaign(campaignId),
                    api.listMissionMatches(missionId)
                ]);
                
                const missionData = missionDataList.find((m: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => m.id === missionId);

                if (missionData) {
                    setSelectedMission(missionData);
                    reset({
                        title: missionData.title,
                        missionDetails: missionData.missionDetails,
                        map: missionData.map,
                        config: missionData.config || '{}',
                    });
                }
                if (matchData) {
                    // Normalize MatchType just in case
                    const normalizedMatches = matchData.map((m: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => ({
                        ...m,
                        matchType: Number(m.matchType) as MatchType
                    }));
                    setDraftMatches(normalizedMatches);
                }
            } else {
                setSelectedMission(null);
                setDraftMatches([]);
                reset({
                    title: '',
                    missionDetails: '',
                    map: '',
                    config: '{}',
                });
            }
        } catch (error) {
            console.error('Error loading mission data:', error);
            if (notify) notify('error', 'Failed to load mission details', (error as Error).message);
        }
    };

    useEffect(() => {
        loadData();
    }, [isOpen, missionId, campaignId]);

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
        return availablePlayers.map(p => ({ value: p.id, label: `${p.playerName} (${p.army_rule_name || ''})` }));
    }, [availablePlayers]);

    const generateMatches = useCallback(() => {
        const teamSize = matchType;
        const playersPerMatch = teamSize * 2;
        const matchCount = Math.floor(availablePlayers.length / playersPerMatch);

        if (matchCount === 0) {
            if (notify) notify('warning', 'Not enough unmatched players for this match type.');
            return;
        }

        const newMatches: MissionMatch[] = [];
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
            if (notify) notify('warning', 'A player cannot be selected more than once in this mission.');
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

    const onSubmit: SubmitHandler<MissionInput> = useCallback(async (data) => {
        try {
            let currentMissionId = missionId;
            if (!currentMissionId) {
                const created = await api.createMission(campaignId, data);
                currentMissionId = created.id;
                if (notify) notify('success', 'Mission created successfully');
            } else {
                await api.updateMission(currentMissionId, data);
                if (notify) notify('success', 'Mission updated successfully');
            }

            // Save matches
            if (currentMissionId) {
                await api.replaceMissionMatches(currentMissionId, draftMatches);
            }

            onFormClose();
        } catch (error) {
            console.error('Error saving mission:', error);
            if (notify) notify('error', 'Error saving mission', (error as Error).message);
        }
    }, [missionId, campaignId, draftMatches, notify, onFormClose]);

    return (
        <>
        <Modal
            title={selectedMission ? 'Edit mission' : 'Create mission'}
            closable={false}
            onCancel={onFormClose}
            open={isOpen}
            width={720}
            footer={null}
        >
            <form id='missionForm' className='detailsForm' onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <label htmlFor="mission-title">Title</label>
                <input id="mission-title" type="text" required {...register('title')} />

                <Row gutter={24}>
                    <Col span={12}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label htmlFor="mission-details">Mission details</label>
                            <textarea id="mission-details" rows={4} {...register('missionDetails')}></textarea>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 8 }}>
                                <label>Map Preview</label>
                                <Button 
                                    type="primary" 
                                    size="small"
                                    onClick={() => setMapBuilderOpen(true)}
                                >
                                    Open Map Builder
                                </Button>
                            </div>
                            <div style={{ height: 200, width: '100%', border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                                <MapCanvas 
                                    key={currentMap?.length || 0} // Force remount on map update
                                    readonly 
                                    initialMapJson={currentMap || ''} 
                                />
                            </div>
                            <input type="hidden" id="mission-map" {...register('map')} />
                            
                            <label htmlFor="mission-config" style={{ marginTop: 12 }}>Config (JSON object)</label>
                            <textarea id="mission-config" rows={4} {...register('config')}></textarea>
                        </div>
                    </Col>
                    
                    <Col span={12}>
                        <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
                            <Typography.Title level={4} style={{ marginTop: 0 }}>Match builder</Typography.Title>
                            
                            <div id="mission-match-builder-controls" style={{ display: availablePlayers.length > 0 ? 'flex' : 'none', flexDirection: 'column', gap: 8 }}>
                                <label htmlFor="mission-match-type">Match type</label>
                                <Select 
                                    id="mission-match-type" 
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
                                
                                <label htmlFor="mission-match-team-a">Team A players</label>
                                <Select 
                                    mode="multiple" 
                                    options={playerOptions}
                                    value={teamA}
                                    onChange={setTeamA}
                                />
                                
                                <label htmlFor="mission-match-team-b">Team B players</label>
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
                                            <Typography.Text type="secondary">{player.army_rule_name || ''}</Typography.Text>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </Col>
                </Row>

                <Space style={{ padding: '10px 0 0 0', justifyContent: 'flex-start', width: '100%' }}>
                    <Button type="primary" htmlType="submit">
                        {selectedMission ? 'Save mission' : 'Create mission'}
                    </Button>
                    <Button type="default" onClick={onFormClose}>Cancel</Button>
                </Space>
            </form>
        </Modal>

        <Modal
            title="Map Builder"
            open={mapBuilderOpen}
            onCancel={() => setMapBuilderOpen(false)}
            footer={null}
            width="90vw"
            style={{ top: 20 }}
            styles={{ body: { height: '80vh', padding: 0 } }}
            destroyOnClose
        >
            <MapCanvas 
                initialMapJson={getValues('map') || ''} 
                onSave={(json) => {
                    setValue('map', json, { shouldDirty: true });
                    setMapBuilderOpen(false);
                }} 
            />
        </Modal>
        </>
    )
}

export default MissionModal;