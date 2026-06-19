import React, { useState, useEffect, useCallback } from 'react';
import { Button, Empty } from 'antd';
import { api } from '../../api';
import type { Rule, TabOptions } from '../../types';
import ArmyRuleCard from '../../components/ArmyRuleCard';
import RuleModal from './RuleModal';

const CampaignRulesTab = ({ campaignId, notify }: TabOptions) => {
    const [rules, setRules] = useState<Rule[]>([]);
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);

    const loadData = async () => {
        try {
            const data = await api.listRulesByCampaign(campaignId);
            setRules(data);
        } catch (error: any) {
            console.error(error);
            if (notify) notify('error', 'Failed to load Campaign Rules', error.message || String(error));
        }
    };

    useEffect(() => {
        loadData();
    }, [campaignId]);

    const onCreateRule = useCallback(() => {
        setSelectedRuleId(null);
        setIsRuleModalOpen(true);
    }, []);

    const onEditRule = useCallback((id: number) => {
        setSelectedRuleId(id);
        setIsRuleModalOpen(true);
    }, []);

    const onDeleteRule = useCallback((id: number) => {
        api.deleteRule(id).then(() => {
            if (notify) notify('success', 'Rule deleted');
            loadData();
        }).catch((err: any) => {
            if (notify) notify('error', 'Failed to delete', err.message);
        });
    }, [notify]);

    return (
        <div className="split">
            <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2>Campaign Rules</h2>
                    <Button id="new-campaign-rule-button" type="primary" onClick={onCreateRule}>
                        New Campaign Rule
                    </Button>
                </div>
                
                {rules.length === 0 ? (
                    <Empty description="No global rules added to this campaign yet." />
                ) : (
                    rules.map(rule => (
                        <ArmyRuleCard 
                            key={rule.id} 
                            rule={rule} 
                            onEdit={onEditRule} 
                            onDelete={onDeleteRule} 
                        />
                    ))
                )}
            </div>

            <RuleModal 
                ruleId={selectedRuleId} 
                parentType="campaign" 
                parentId={campaignId} 
                isOpen={isRuleModalOpen} 
                onClose={() => {
                    setIsRuleModalOpen(false);
                    loadData();
                }} 
                notify={notify} 
                existingRulesTree={rules}
            />
        </div>
    );
};

export default CampaignRulesTab;
