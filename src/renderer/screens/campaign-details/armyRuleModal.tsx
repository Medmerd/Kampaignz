import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { api } from '../../api';
import type { ArmyRulebook, NotifyFunction } from '../../types';

export type ArmyRuleModalOptions = {
    armyRuleId: number | null;
    campaignId: number;
    isOpen: boolean;
    onClose: () => void;
    notify?: NotifyFunction;
};

const ArmyRuleModal = ({ armyRuleId, campaignId, isOpen, onClose, notify }: ArmyRuleModalOptions) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (armyRuleId) {
                setLoading(true);
                api.getArmyRulebook(armyRuleId).then((rulebook: ArmyRulebook) => {
                    form.setFieldsValue({
                        name: rulebook.name,
                        description: rulebook.description,
                    });
                }).catch((err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
                    if (notify) notify('error', 'Failed to load Army Rulebook', err.message);
                }).finally(() => {
                    setLoading(false);
                });
            } else {
                form.resetFields();
            }
        }
    }, [isOpen, armyRuleId, form, notify]);

    const handleSave = async (values: { name: string, description: string }) => {
        try {
            if (armyRuleId) {
                await api.updateArmyRulebook(armyRuleId, values);
                if (notify) notify('success', 'Army Rulebook updated');
            } else {
                await api.createArmyRulebook(campaignId, values);
                if (notify) notify('success', 'Army Rulebook created');
            }
            onClose();
        } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
            if (notify) notify('error', 'Failed to save Army Rulebook', error.message);
        }
    };

    return (
        <Modal
            title={armyRuleId ? "Edit Army Rulebook" : "New Army Rulebook"}
            open={isOpen}
            onCancel={onClose}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 20 }}>
                <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the rulebook name!' }]}>
                    <Input disabled={loading} />
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <Input.TextArea rows={4} disabled={loading} />
                </Form.Item>
                <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                    <Button onClick={onClose} style={{ marginRight: 8 }}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ArmyRuleModal;
