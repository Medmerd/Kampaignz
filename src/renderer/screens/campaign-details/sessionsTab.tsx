import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'antd';
import { api } from '../../api';
import { formatDate } from '../../utils/format';
import type { Session, TabOptions } from '../../types';
import SessionModal from './sessionModal';

const SessionsTab = ({ campaignId, notify }: TabOptions) => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

    const loadData = async () => {
        try {
            const data = await api.listSessionsByCampaign(campaignId);
            setSessions(data);
        } catch (error) {
            console.error(error);
            if (notify) {
                notify('error', 'Failed to load sessions', error.message || String(error));
            }
        }
    };

    useEffect(() => {
        loadData();
    }, [campaignId]);

    const onCreateSession = useCallback(() => {
        setSelectedSessionId(null);
        setIsDrawerOpen(true);
    }, []);

    const onEditSession = useCallback((sessionId: number) => {
        setSelectedSessionId(sessionId);
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
                    <h2>Sessions</h2>
                    <Button id="new-session-button" className="secondary-button" type="primary" onClick={onCreateSession}>
                        New session
                    </Button>
                </div>
                
                <ul className="campaign-list" style={{ listStyle: 'none', padding: 0 }}>
                    {sessions.map((session) => (
                        <li key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{session.title}</div>
                                <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }}>Created {formatDate(session.created_at)}</div>
                            </div>
                            <Button onClick={() => onEditSession(session.id)}>Edit</Button>
                        </li>
                    ))}
                </ul>
            </div>

            <SessionModal 
                sessionId={selectedSessionId || 0} 
                campaignId={campaignId} 
                isOpen={isDrawerOpen} 
                onClose={onClose} 
                notify={notify} 
            />
        </div>
    );
}

export default SessionsTab;