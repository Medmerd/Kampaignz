import React, { useState, useEffect, useCallback } from 'react';
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { Select, Modal, Space, Button } from 'antd';
import { api } from '../../api';
import type { Step, StepModalOptions, StepInput, Session } from '../../types';

const StepsModal = (options: StepModalOptions) => {
    const { campaignId, stepId, isOpen, onClose, notify, step } = options;
    const [sessions, setSessions] = useState<Session[]>([]);

    const { register, control, reset, handleSubmit } = useForm<Step>({
        defaultValues: {
            campaign_id: campaignId,
            id: stepId,
            title: '',
            notes: '',
            config: '{}',
            session_ids: [],
            created_at: '',
        }
    });

    const loadData = async () => {
        if (!isOpen) return;

        try {
            const loadedSessions = await api.listSessionsByCampaign(campaignId);
            setSessions(loadedSessions);
        } catch (err) {
            console.error('Failed to load sessions:', err);
        }

        if (step) {
            reset(step);
        } else {
            reset({
                campaign_id: campaignId,
                id: -1,
                title: '',
                notes: '',
                config: '{}',
                session_ids: [],
                created_at: '',
            });
        }
    };

    useEffect(() => {
        loadData();
    }, [isOpen, step, campaignId]);

    const onSubmit: SubmitHandler<Step> = useCallback(async (data) => {
        const { id, session_ids, campaign_id, ...rest } = data;
        const input: StepInput = { ...rest, sessionIds: session_ids, campaignId: campaign_id };

        try {
            if (id && id > 0) {
                await api.updateStep(id, input);
                if (notify) notify('success', 'Step updated', 'The step was updated successfully.');
            } else {
                await api.createStep(campaign_id, input);
                if (notify) notify('success', 'Step created', 'The step was created successfully.');
            }
            onClose();
        } catch (error) {
            console.error('Error saving step:', error);
            if (notify) notify('error', 'Error saving step', (error as Error).message || String(error));
        }
    }, [notify, onClose]);

    return (
        <Modal
            title={stepId && stepId > 0 ? 'Edit step' : 'Create step'}
            closable={false}
            onCancel={onClose}
            open={isOpen}
            width={720}
            footer={null}
        >
            <form id='stepForm' className='detailsForm' onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <label htmlFor="step-title">Title</label>
                <input id="step-title" type="text" required {...register('title')} />
                
                <label htmlFor="step-session-ids">Sessions</label>
                <Controller
                    name="session_ids"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            id="step-session-ids"
                            mode="multiple"
                            style={{ width: '100%' }}
                            options={sessions.map(session => ({ value: session.id, label: session.title }))}
                        />
                    )}
                />
                
                <label htmlFor="step-notes">Notes</label>
                <textarea id="step-notes" rows={4} {...register('notes')}></textarea>
                
                <label htmlFor="step-config">Config (JSON object)</label>
                <textarea id="step-config" rows={4} {...register('config')}></textarea>

                <Space style={{ padding: '10px 0 0 0', justifyContent: 'flex-start', width: '100%' }}>
                    <Button type="primary" htmlType="submit">
                        {stepId && stepId > 0 ? 'Save step' : 'Create step'}
                    </Button>
                    <Button type="default" onClick={onClose}>Cancel</Button>
                </Space>
            </form>
        </Modal>
    )
}

export default StepsModal;