import React, { useState, useEffect, useCallback } from 'react';
import { Button, Tag } from 'antd';
import { api } from '../../api';
import { formatDate } from '../../utils/format';
import ArmyRuleModal from './armyRuleModal';
import ArmyRulebookDetailsDrawer from './ArmyRulebookDetailsDrawer';

const ArmyRulesTab = ({ campaignId, notify }: TabOptions) => {
    const [rulebooks, setRulebooks] = useState<ArmyRulebook[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedRulebookId, setSelectedRulebookId] = useState<number | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [selectedRulebookForDrawer, setSelectedRulebookForDrawer] = useState<ArmyRulebook | null>(null);

    const loadData = async () => {
        try {
            const data = await api.listArmyRulebooksByCampaign(campaignId);
            setRulebooks(data);
        } catch (error: any) {
            console.error(error);
            if (notify) notify('error', 'Failed to load Army Rulebooks', error.message || String(error));
        }
    };

    useEffect(() => {
        loadData();
    }, [campaignId]);

    const onCreateRulebook = useCallback(() => {
        setSelectedRulebookId(null);
        setIsModalOpen(true);
    }, []);

    const onEditRulebook = useCallback((id: number) => {
        setSelectedRulebookId(id);
        setIsModalOpen(true);
    }, []);

    const onClose = useCallback(() => {
        setIsModalOpen(false);
        loadData();
    }, []);

    const onOpenDrawer = useCallback((rulebook: ArmyRulebook) => {
        setSelectedRulebookForDrawer(rulebook);
        setIsDrawerOpen(true);
    }, []);

    return (
        <div className="split">
            <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2>Army Rulebooks</h2>
                    <Button id="new-army-rulebook-button" type="primary" onClick={onCreateRulebook}>
                        New Army Rulebook
                    </Button>
                </div>
                
                <ul className="campaign-list" style={{ listStyle: 'none', padding: 0 }}>
                    {rulebooks.map((rulebook) => {
                        const isShared = rulebook.original_campaign_id !== campaignId;
                        return (
                            <li key={rulebook.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>
                                        {rulebook.name} {isShared && <Tag color="blue" style={{ marginLeft: 8 }}>Shared</Tag>}
                                    </div>
                                    <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }}>Created {formatDate(rulebook.created_at)}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button onClick={() => onOpenDrawer(rulebook)}>Manage Rules</Button>
                                    <Button onClick={() => onEditRulebook(rulebook.id)}>Edit</Button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <ArmyRuleModal 
                armyRuleId={selectedRulebookId} 
                campaignId={campaignId} 
                isOpen={isModalOpen} 
                onClose={onClose} 
                notify={notify} 
            />

            <ArmyRulebookDetailsDrawer 
                rulebook={selectedRulebookForDrawer}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                notify={notify}
            />
        </div>
    );
};

export default ArmyRulesTab;
