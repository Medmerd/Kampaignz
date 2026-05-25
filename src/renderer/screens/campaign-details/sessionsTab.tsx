import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'antd';
import { api } from '../../api';
import { formatDate } from '../../utils/format';
import type { Session, TabOptions } from '../../types';
import SessionModal from './sessionModal';

const SessionsTab = ({ campaignId, notify }: TabOptions) => {
    const [selectedSession, setSelectedSession] = useState<Session | undefined>(undefined);
    const [selectedSessionId, setSelectedSessionId] = useState<number>(-1);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    const loadData = async () => {
        try {
            const fetchedSessions = await api.listSessionsByCampaign(campaignId);
            setSessions(fetchedSessions);
        } catch (error) {
            console.error('Failed to load sessions:', error);
            if (notify) notify('error', 'Failed to load sessions', (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [campaignId]);

    const onCreateSession = useCallback(() => {
        setSelectedSessionId(-1);
        setSelectedSession(undefined);
        setIsDrawerOpen(true);
    }, []);

    const onEditSession = useCallback((sessionId: number) => {
        const session = sessions.find(s => s.id === sessionId);
        setSelectedSessionId(sessionId);
        setSelectedSession(session);
        setIsDrawerOpen(true);
    }, [sessions]);

    const onClose = () => {
        setIsDrawerOpen(false);
        loadData();
    };

    if (loading) {
        return (<div>Loading...</div>);
    }

    return (
        <div className="split">
            <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2>Campaign Sessions</h2>
                    <Button id="new-session-button" className="secondary-button" type="primary" onClick={onCreateSession}>
                        New session
                    </Button>
                </div>

                <ul className="campaign-list" style={{ listStyle: 'none', padding: 0 }}>
                    {sessions.map((session) => (
                        <li key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{session.title}</div>
                                <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }}>
                                    {session.mission_ids.length > 0 ? `${session.mission_ids.length} mission(s)` : 'Not initialized'} • Created {formatDate(session.created_at)}
                                </div>
                            </div>
                            <Button onClick={() => onEditSession(session.id)}>Edit</Button>
                        </li>
                    ))}
                </ul>
            </div>

            <SessionModal 
                session={selectedSession} 
                sessionId={selectedSessionId} 
                campaignId={campaignId} 
                isOpen={isDrawerOpen} 
                onClose={onClose} 
                notify={notify} 
            />
        </div>
    );
}

export default SessionsTab;
