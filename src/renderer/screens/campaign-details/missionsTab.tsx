import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'antd';
import { api } from '../../api';
import { formatDate } from '../../utils/format';
import type { Mission, TabOptions } from '../../types';
import MissionModal from './missionModal';

const MissionsTab = ({ campaignId, notify }: TabOptions) => {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);

    const loadData = async () => {
        try {
            const data = await api.listMissionsByCampaign(campaignId);
            setMissions(data);
        } catch (error: any) {
            console.error(error);
            if (notify) {
                notify('error', 'Failed to load missions', error.message || String(error));
            }
        }
    };

    useEffect(() => {
        loadData();
    }, [campaignId]);

    const onCreateMission = useCallback(() => {
        setSelectedMissionId(null);
        setIsDrawerOpen(true);
    }, []);

    const onEditMission = useCallback((missionId: number) => {
        setSelectedMissionId(missionId);
        setIsDrawerOpen(true);
    }, []);

    const onClose = useCallback(() => {
        setIsDrawerOpen(false);
        loadData();
    }, []);

    return (
        <div className="split">
            <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2>Missions</h2>
                    <Button id="new-mission-button" className="secondary-button" type="primary" onClick={onCreateMission}>
                        New mission
                    </Button>
                </div>
                
                <ul className="campaign-list" style={{ listStyle: 'none', padding: 0 }}>
                    {missions.map((mission) => (
                        <li key={mission.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{mission.title}</div>
                                <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }}>Created {formatDate(mission.created_at)}</div>
                            </div>
                            <Button onClick={() => onEditMission(mission.id)}>Edit</Button>
                        </li>
                    ))}
                </ul>
            </div>

            <MissionModal 
                missionId={selectedMissionId || 0} 
                campaignId={campaignId} 
                isOpen={isDrawerOpen} 
                onClose={onClose} 
                notify={notify} 
            />
        </div>
    );
}

export default MissionsTab;