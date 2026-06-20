import React, { useState, useEffect } from 'react';
import { Drawer, Button, Typography, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { api } from '../../api';
import type { ArmyRulebook, Rule, NotifyFunction } from '../../types';
import ArmyRuleCard from '../../components/ArmyRuleCard';
import RuleModal from './RuleModal';
import { parseBattlescribeXML, XMLRuleCapture } from '../../utils/xml-parser';
import XMLImportReviewModal from './XMLImportReviewModal';

const { Text } = Typography;

export type DrawerProps = {
    rulebook: ArmyRulebook | null;
    isOpen: boolean;
    onClose: () => void;
    notify?: NotifyFunction;
};

const ArmyRulebookDetailsDrawer = ({ rulebook, isOpen, onClose, notify }: DrawerProps) => {
    const [rules, setRules] = useState<Rule[]>([]);
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [xmlCaptures, setXmlCaptures] = useState<XMLRuleCapture[]>([]);

    const handleXMLDump = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !rulebook) return;
        try {
            if (notify) notify('info', 'Parsing XML...', 'Reading Battlescribe data...');
            const extractedCaptures = await parseBattlescribeXML(file);
            
            setXmlCaptures(extractedCaptures);
            setIsReviewModalOpen(true);
        } catch (e: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
            console.error(e);
            if (notify) notify('error', 'Extraction Failed', e.message);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const loadRules = async () => {
        if (!rulebook) return;
        try {
            const data = await api.listRulesByArmyRulebook(rulebook.id);
            setRules(data);
        } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
            if (notify) notify('error', 'Failed to load rules', error.message);
        }
    };

    useEffect(() => {
        if (isOpen && rulebook) {
            loadRules();
        }
    }, [isOpen, rulebook]);

    const handleCreate = () => {
        setSelectedRuleId(null);
        setIsRuleModalOpen(true);
    };

    const handleEdit = (id: number) => {
        setSelectedRuleId(id);
        setIsRuleModalOpen(true);
    };

    const handleDelete = (id: number) => {
        api.deleteRule(id).then(() => {
            if (notify) notify('success', 'Rule deleted');
            loadRules();
        }).catch((err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
            if (notify) notify('error', 'Failed to delete', err.message);
        });
    };

    return (
        <Drawer
            title={rulebook ? `Army Rulebook: ${rulebook.name}` : ''}
            placement="right"
            width={600}
            onClose={onClose}
            open={isOpen}
            extra={
                <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                        type="file" 
                        accept=".cat,.xml" 
                        style={{ display: 'none' }} 
                        ref={fileInputRef}
                        onChange={handleXMLDump}
                    />
                    <Button onClick={() => fileInputRef.current?.click()}>
                        Import Battlescribe (.cat)
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Add Rule
                    </Button>
                </div>
            }
        >
            {rulebook && (
                <div style={{ marginBottom: 24 }}>
                    <Text type="secondary">{rulebook.description}</Text>
                </div>
            )}
            
            {rules.length === 0 ? (
                <Empty description="No rules added to this rulebook yet." />
            ) : (
                rules.map(rule => (
                    <ArmyRuleCard 
                        key={rule.id} 
                        rule={rule} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                    />
                ))
            )}

            {rulebook && (
                <RuleModal 
                    ruleId={selectedRuleId}
                    parentType="army_rule"
                    parentId={rulebook.id}
                    isOpen={isRuleModalOpen}
                    onClose={() => {
                        setIsRuleModalOpen(false);
                        loadRules();
                    }}
                    notify={notify}
                    existingRulesTree={rules}
                />
            )}

            {rulebook && (
                <XMLImportReviewModal 
                    isOpen={isReviewModalOpen}
                    onClose={() => {
                        setIsReviewModalOpen(false);
                        loadRules();
                    }}
                    armyRulebookId={rulebook.id}
                    initialCaptures={xmlCaptures}
                    notify={notify}
                />
            )}
        </Drawer>
    );
};

export default ArmyRulebookDetailsDrawer;
