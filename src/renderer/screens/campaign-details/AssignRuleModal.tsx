import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from "react-hook-form";
import { Modal, Space, Button, Select } from 'antd';
import { api } from '../../api';
import type { Rule } from '../../types';

export type AssignRuleModalOptions = {
    playerId: number | null;
    campaignId: number;
    armyRuleId: number | null;
    isOpen: boolean;
    onClose: () => void;
    notify?: (type: 'success' | 'error' | 'info' | 'warning', message: string, description?: string) => void;
};

type FormData = {
    rule_id: number | null;
};

const AssignRuleModal = ({ playerId, campaignId, armyRuleId, isOpen, onClose, notify }: AssignRuleModalOptions) => {
    const [eligibleRules, setEligibleRules] = useState<{ value: number, label: string, category: string }[]>([]);

    const { control, handleSubmit, reset } = useForm<FormData>({
        defaultValues: { rule_id: null }
    });

    const loadData = useCallback(async () => {
        if (!isOpen) return;

        try {
            // Fetch campaign rules
            const campaignRules = await api.listRulesByCampaign(campaignId);
            
            const allRules = [...campaignRules];
            
            setEligibleRules(allRules.map(r => ({
                value: r.id,
                label: r.name,
                category: r.rule_category
            })));

            reset({ rule_id: null });
        } catch (error) {
            console.error('Error loading eligible rules:', error);
            if (notify) notify('error', 'Failed to load rules', (error as Error).message);
        }
    }, [isOpen, campaignId, armyRuleId, notify, reset]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onSubmit = async (data: FormData) => {
        if (!playerId || !data.rule_id) return;

        try {
            await api.assignRuleToPlayer(playerId, data.rule_id);
            if (notify) notify('success', 'Rule Assigned', 'The rule was successfully assigned to the player.');
            onClose();
        } catch (error) {
            console.error('Error assigning rule:', error);
            if (notify) notify('error', 'Assignment Failed', (error as Error).message);
        }
    };

    // Group options by category for the Select dropdown
    const groupedOptions = eligibleRules.reduce((acc, rule) => {
        const group = acc.find(g => g.label === rule.category);
        if (group) {
            group.options.push({ value: rule.value, label: rule.label });
        } else {
            acc.push({
                label: rule.category,
                options: [{ value: rule.value, label: rule.label }]
            });
        }
        return acc;
    }, [] as { label: string, options: { value: number, label: string }[] }[]);

    return (
        <Modal
            title="Assign Rule to Player"
            closable={false}
            onCancel={onClose}
            open={isOpen}
            footer={null}
        >
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                <Controller
                    name="rule_id"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <Select 
                            {...field} 
                            options={groupedOptions} 
                            style={{ width: '100%' }}
                            placeholder="Select a rule to assign"
                            showSearch
                            optionFilterProp="label"
                        />
                    )}
                />
                <Space style={{ padding: '10px 0 0 0', justifyContent: 'flex-start', width: '100%' }}>
                    <Button type="primary" htmlType="submit">
                        Assign Rule
                    </Button>
                    <Button type="default" onClick={onClose}>Cancel</Button>
                </Space>
            </form>
        </Modal>
    );
};

export default AssignRuleModal;
