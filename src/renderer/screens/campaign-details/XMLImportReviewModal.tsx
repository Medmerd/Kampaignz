import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, Form, Input, Select, Popconfirm, Table } from 'antd';
import { api } from '../../api';
import type { XMLRuleCapture } from '../../utils/xml-parser';
import type { NotifyFunction } from '../../types';

export type XMLImportReviewModalProps = {
    isOpen: boolean;
    onClose: () => void;
    armyRulebookId: number;
    initialCaptures: XMLRuleCapture[];
    notify?: NotifyFunction;
};

const CATEGORIES = [
    'Army Rule', 'Detachment', 'Enhancement', 'Stratagem', 
    'Crusade Rule', 'Boarding Action', 'Sub-Rule', 'Campaign Rule', 'Mission Rule'
];

const XMLImportReviewModal = ({ isOpen, onClose, armyRulebookId, initialCaptures, notify }: XMLImportReviewModalProps) => {
    const [captures, setCaptures] = useState<XMLRuleCapture[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedCapture, setSelectedCapture] = useState<XMLRuleCapture | null>(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (isOpen) {
            setCaptures(initialCaptures);
            setSelectedRowKeys(initialCaptures.filter(c => c.selected).map(c => c.id));
            setSelectedCapture(null);
        }
    }, [isOpen, initialCaptures]);

    useEffect(() => {
        if (selectedCapture) {
            form.setFieldsValue({
                name: selectedCapture.name,
                rule_category: selectedCapture.rule_category,
                description: selectedCapture.description,
                metadata: selectedCapture.metadata || ''
            });
        }
    }, [selectedCapture, form]);

    const handleUpdateCapture = (values: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
        if (!selectedCapture) return;
        const updated = captures.map(c => c.id === selectedCapture.id ? { ...c, ...values } : c);
        setCaptures(updated);
        setSelectedCapture(null);
    };

    const handleImportSelected = async () => {
        const rulesToImport = captures.filter(c => selectedRowKeys.includes(c.id));
        if (rulesToImport.length === 0) {
            if (notify) notify('warning', 'No rules selected for import.');
            return;
        }

        try {
            setLoading(true);
            for (const capture of rulesToImport) {
                const payload = {
                    name: capture.name,
                    rule_category: capture.rule_category,
                    description: capture.description,
                    metadata: capture.metadata || null,
                    army_rule_id: armyRulebookId,
                    parent_rule_id: null,
                };
                await api.createRule(payload);
            }
            if (notify) notify('success', `Imported ${rulesToImport.length} rules successfully!`);
            onClose();
        } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
            console.error(error);
            if (notify) notify('error', 'Import Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: '30%',
        },
        {
            title: 'Category',
            dataIndex: 'rule_category',
            key: 'rule_category',
            width: '20%',
        },
        {
            title: 'Description Preview',
            dataIndex: 'description',
            key: 'description',
            render: (text: string) => text ? text.substring(0, 80) + '...' : ''
        }
    ];

    return (
        <Modal
            title="Review Battlescribe XML Import"
            open={isOpen}
            onCancel={onClose}
            width="90vw"
            footer={null}
            style={{ top: 20 }}
            bodyStyle={{ height: '80vh', display: 'flex', gap: 20, paddingBottom: 0 }}
        >
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Table 
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
                    }}
                    columns={columns} 
                    dataSource={captures.map(c => ({ ...c, key: c.id }))} 
                    pagination={false}
                    scroll={{ y: 'calc(80vh - 120px)' }}
                    onRow={(record) => {
                        return {
                            onClick: () => {
                                setSelectedCapture(record);
                            },
                        };
                    }}
                    rowClassName={(record) => selectedCapture?.id === record.id ? 'ant-table-row-selected' : ''}
                    style={{ cursor: 'pointer' }}
                />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '1px solid #f0f0f0', paddingLeft: 20 }}>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {selectedCapture ? (
                        <Form form={form} layout="vertical" onFinish={handleUpdateCapture}>
                            <h3>Edit Rule</h3>
                            <Form.Item name="name" label="Rule Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="rule_category" label="Category" rules={[{ required: true }]}>
                                <Select options={CATEGORIES.map(c => ({ value: c, label: c }))} />
                            </Form.Item>
                            <Form.Item name="description" label="Description">
                                <Input.TextArea rows={8} />
                            </Form.Item>
                            <Form.Item name="metadata" label="Metadata (JSON)">
                                <Input.TextArea rows={3} />
                            </Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit">Save Adjustments</Button>
                                <Button onClick={() => setSelectedCapture(null)}>Cancel</Button>
                            </Space>
                        </Form>
                    ) : (
                        <div style={{ color: '#888', marginTop: 40, textAlign: 'center' }}>
                            Select a rule from the table on the left to edit it.
                        </div>
                    )}
                </div>

                <div style={{ padding: '20px 0', borderTop: '1px solid #f0f0f0', textAlign: 'right' }}>
                    <h3 style={{ margin: '0 0 16px 0', textAlign: 'left' }}>Rules to Import: {selectedRowKeys.length} / {captures.length}</h3>
                    <Space>
                        <Button onClick={onClose} disabled={loading}>Cancel</Button>
                        <Popconfirm title={`Import ${selectedRowKeys.length} rules?`} onConfirm={handleImportSelected}>
                            <Button type="primary" loading={loading} disabled={selectedRowKeys.length === 0}>Import Selected</Button>
                        </Popconfirm>
                    </Space>
                </div>
            </div>
        </Modal>
    );
};

export default XMLImportReviewModal;
