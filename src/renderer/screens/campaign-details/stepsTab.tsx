import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'antd';
import { api } from '../../api';
import { escapeHtml } from '../../utils/dom';
import { formatDate } from '../../utils/format';
import type { Step, TabOptions } from '../../types';
import StepsModal from './stepsModal';

const StepsTab = ({ campaignId, notify }: TabOptions) => {
    const [selectedStep, setSelectedStep] = useState<Step>(null);
    const [selectedStepId, setSelectedStepId] = useState<number>(-1);
    const [steps, setSteps] = useState<Step[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    const loadData = async () => {
        try {
            const fetchedSteps = await api.listStepsByCampaign(campaignId);
            setSteps(fetchedSteps);
        } catch (error) {
            console.error('Failed to load steps:', error);
            if (notify) notify('error', 'Failed to load steps', (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [campaignId]);

    const onCreateStep = useCallback(() => {
        setSelectedStepId(-1);
        setSelectedStep(null);
        setIsDrawerOpen(true);
    }, []);

    const onEditStep = useCallback((stepId: number) => {
        const step = steps.find(s => s.id === stepId) || null;
        setSelectedStepId(stepId);
        setSelectedStep(step);
        setIsDrawerOpen(true);
    }, [steps]);

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
                    <h2>Campaign Steps</h2>
                    <Button id="new-step-button" className="secondary-button" type="primary" onClick={onCreateStep}>
                        New step
                    </Button>
                </div>

                <ul className="campaign-list" style={{ listStyle: 'none', padding: 0 }}>
                    {steps.map((step) => (
                        <li key={step.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{step.title}</div>
                                <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }}>
                                    {step.session_ids.length > 0 ? `${step.session_ids.length} session(s)` : 'Not initialized'} • Created {formatDate(step.created_at)}
                                </div>
                            </div>
                            <Button onClick={() => onEditStep(step.id)}>Edit</Button>
                        </li>
                    ))}
                </ul>
            </div>

            <StepsModal 
                step={selectedStep} 
                stepId={selectedStepId} 
                campaignId={campaignId} 
                isOpen={isDrawerOpen} 
                onClose={onClose} 
                notify={notify} 
            />
        </div>
    );
}

export default StepsTab;