import React, { useState, useEffect, useCallback } from 'react';
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { Select, Modal, Space, Button } from 'antd';
import { api } from '../../api';
import type { Session, SessionModalOptions, SessionInput, Mission } from '../../types';

const SessionModal = (options: SessionModalOptions) => {
    const { campaignId, sessionId, isOpen, onClose, notify, session } = options;
    const [missions, setMissions] = useState<Mission[]>([]);

    const { register, control, reset, handleSubmit } = useForm<Session>({
        defaultValues: {
            campaign_id: campaignId,
            id: sessionId,
            title: '',
            notes: '',
            config: '{}',
            mission_ids: [],
            created_at: '',
        }
    });

    const loadData = async () => {
        if (!isOpen) return;

        try {
            const loadedMissions = await api.listMissionsByCampaign(campaignId);
            setMissions(loadedMissions);
        } catch (err) {
            console.error('Failed to load missions:', err);
        }

        if (session) {
            reset(session);
        } else {
            reset({
                campaign_id: campaignId,
                id: -1,
                title: '',
                notes: '',
                config: '{}',
                mission_ids: [],
                created_at: '',
            });
        }
    };

    useEffect(() => {
        loadData();
    }, [isOpen, session, campaignId]);

    const onSubmit: SubmitHandler<Session> = useCallback(async (data) => {
        const { id, mission_ids, campaign_id, ...rest } = data;
        const input: SessionInput = { ...rest, missionIds: mission_ids, campaignId: campaign_id };

        try {
            if (id && id > 0) {
                await api.updateSession(id, input);
                if (notify) notify('success', 'Session updated', 'The session was updated successfully.');
            } else {
                await api.createSession(campaign_id, input);
                if (notify) notify('success', 'Session created', 'The session was created successfully.');
            }
            onClose();
        } catch (error) {
            console.error('Error saving session:', error);
            if (notify) notify('error', 'Error saving session', (error as Error).message || String(error));
        }
    }, [notify, onClose]);

    return (
        <Modal
            title={sessionId && sessionId > 0 ? 'Edit session' : 'Create session'}
            closable={false}
            onCancel={onClose}
            open={isOpen}
            width={720}
            footer={null}
        >
            <form id='sessionForm' className='detailsForm' onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <label htmlFor="session-title">Title</label>
                <input id="session-title" type="text" required {...register('title')} />
                
                <label htmlFor="session-mission-ids">Missions</label>
                <Controller
                    name="mission_ids"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            id="session-mission-ids"
                            mode="multiple"
                            style={{ width: '100%' }}
                            options={missions.map(mission => ({ value: mission.id, label: mission.title }))}
                        />
                    )}
                />
                
                <label htmlFor="session-notes">Notes</label>
                <textarea id="session-notes" rows={4} {...register('notes')}></textarea>
                
                <label htmlFor="session-config">Config (JSON object)</label>
                <textarea id="session-config" rows={4} {...register('config')}></textarea>

                <Space style={{ padding: '10px 0 0 0', justifyContent: 'flex-start', width: '100%' }}>
                    <Button type="primary" htmlType="submit">
                        {sessionId && sessionId > 0 ? 'Save session' : 'Create session'}
                    </Button>
                    <Button type="default" onClick={onClose}>Cancel</Button>
                </Space>
            </form>
        </Modal>
    )
}

export default SessionModal;
