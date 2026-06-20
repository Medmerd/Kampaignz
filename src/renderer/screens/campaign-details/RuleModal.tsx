import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Space } from 'antd';
import { api } from '../../api';
import type { Rule, NotifyFunction } from '../../types';

export type RuleModalOptions = {
    ruleId: number | null;
    parentType: 'army_rule' | 'campaign' | 'mission';
    parentId: number;
    isOpen: boolean;
    onClose: () => void;
    notify?: NotifyFunction;
    existingRulesTree: Rule[];
};

const CATEGORIES = [
  'Army Rule', 'Detachment', 'Enhancement', 'Stratagem', 
  'Crusade Rule', 'Boarding Action', 'Sub-Rule', 'Campaign Rule', 'Mission Rule'
];

// Helper to flatten the tree for the dropdown
const flattenRules = (rules: Rule[], excludeId: number | null = null): { value: number, label: string }[] => {
    let result: { value: number, label: string }[] = [];
    for (const r of rules) {
        if (r.id === excludeId) continue; // Don't let a rule be its own parent
        result.push({ value: r.id, label: r.name });
        if (r.children && r.children.length > 0) {
            result = result.concat(flattenRules(r.children, excludeId));
        }
    }
    return result;
};

const RuleModal = ({ ruleId, parentType, parentId, isOpen, onClose, notify, existingRulesTree }: RuleModalOptions) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (ruleId) {
                setLoading(true);
                api.getRule(ruleId).then((rule: Rule) => {
                    let maxPerPlayer = null;
                    let maxCampaignWide = null;
                    let remainingMetadata = '';

                    if (rule.metadata) {
                        try {
                            // If Knex auto-parses the JSON column, rule.metadata might already be an object
                            const parsed = typeof rule.metadata === 'string' 
                                ? JSON.parse(rule.metadata) 
                                : { ...(rule.metadata as any) };

                            if (parsed.max_per_player !== undefined) {
                                maxPerPlayer = parsed.max_per_player;
                                delete parsed.max_per_player;
                            }
                            if (parsed.max_campaign_wide !== undefined) {
                                maxCampaignWide = parsed.max_campaign_wide;
                                delete parsed.max_campaign_wide;
                            }
                            if (Object.keys(parsed).length > 0) {
                                remainingMetadata = JSON.stringify(parsed, null, 2);
                            }
                        } catch (e) {
                            remainingMetadata = typeof rule.metadata === 'string' 
                                ? rule.metadata 
                                : JSON.stringify(rule.metadata, null, 2);
                        }
                    }

                    form.setFieldsValue({
                        name: rule.name,
                        rule_category: rule.rule_category,
                        description: rule.description,
                        max_per_player: maxPerPlayer,
                        max_campaign_wide: maxCampaignWide,
                        metadata: remainingMetadata,
                        parent_rule_id: rule.parent_rule_id,
                    });
                }).catch((err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
                    if (notify) notify('error', 'Failed to load Rule', err.message);
                }).finally(() => setLoading(false));
            } else {
                form.resetFields();
            }
        }
    }, [isOpen, ruleId, form, notify]);

    const handleSave = async (values: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
        try {
            setLoading(true);

            let metadataObj: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ = {};
            if (values.metadata) {
                try {
                    metadataObj = JSON.parse(values.metadata);
                } catch (e) {
                    throw new Error('Metadata must be valid JSON');
                }
            }

            if (values.max_per_player !== null && values.max_per_player !== undefined && values.max_per_player !== '') {
                metadataObj.max_per_player = values.max_per_player;
            }
            if (values.max_campaign_wide !== null && values.max_campaign_wide !== undefined && values.max_campaign_wide !== '') {
                metadataObj.max_campaign_wide = values.max_campaign_wide;
            }

            const finalMetadata = Object.keys(metadataObj).length > 0 ? JSON.stringify(metadataObj) : null;

            const payload = {
                name: values.name,
                rule_category: values.rule_category,
                description: values.description,
                metadata: finalMetadata,
                parent_rule_id: values.parent_rule_id || null,
            };

            if (ruleId) {
                await api.updateRule(ruleId, payload);
                if (notify) notify('success', 'Rule updated');
            } else {
                const createPayload = {
                    ...payload,
                    army_rule_id: parentType === 'army_rule' ? parentId : null,
                    campaign_id: parentType === 'campaign' ? parentId : null,
                    mission_id: parentType === 'mission' ? parentId : null,
                };
                await api.createRule(createPayload);
                if (notify) notify('success', 'Rule created');
            }
            onClose();
        } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
            if (notify) notify('error', 'Failed to save Rule', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={ruleId ? "Edit Rule" : "New Rule"}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 20 }}>
                <Form.Item name="name" label="Rule Name" rules={[{ required: true, message: 'Required' }]}>
                    <Input disabled={loading} />
                </Form.Item>
                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item name="rule_category" label="Category" rules={[{ required: true, message: 'Required' }]} style={{ flex: 1 }}>
                        <Select disabled={loading} options={CATEGORIES.map(c => ({ value: c, label: c }))} />
                    </Form.Item>
                    <Form.Item name="parent_rule_id" label="Parent Rule" style={{ flex: 1 }}>
                        <Select disabled={loading} allowClear placeholder="None (Root Level)" options={flattenRules(existingRulesTree, ruleId)} />
                    </Form.Item>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item name="max_per_player" label="Max Per Player" style={{ flex: 1 }}>
                        <InputNumber disabled={loading} min={1} style={{ width: '100%' }} placeholder="No limit" />
                    </Form.Item>
                    <Form.Item name="max_campaign_wide" label="Max Campaign Wide" style={{ flex: 1 }}>
                        <InputNumber disabled={loading} min={1} style={{ width: '100%' }} placeholder="No limit" />
                    </Form.Item>
                </div>
                <Form.Item name="description" label="Description (Markdown Supported)" rules={[{ required: true, message: 'Required' }]}>
                    <Input.TextArea rows={6} disabled={loading} style={{ fontFamily: 'monospace' }} />
                </Form.Item>
                <Form.Item name="metadata" label="Metadata (Optional JSON)">
                    <Input.TextArea rows={2} disabled={loading} placeholder='{"cost": "1CP", "phase": "Command"}' />
                </Form.Item>
                <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                    <Space>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RuleModal;
