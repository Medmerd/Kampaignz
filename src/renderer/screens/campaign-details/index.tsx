import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Button, Tabs, TabsProps, Card, notification, Layout, Typography, Empty, Space } from 'antd';
import { api } from '../../api';
import { escapeHtml } from '../../utils/dom';
import { formatDate } from '../../utils/format';
import PlayerTab from './playerTab';
import MessagesTab from './messageTab';
import MissionsTab from './missionsTab';
import SessionsTab from './sessionsTab';
import ArmyRulesTab from './armyRulesTab';
import CampaignRulesTab from './CampaignRulesTab';
import CampaignSidebar from './CampaignSidebar';
import type { Campaign, NotificationType } from '../../types';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

type Options = {
    selectedCampaignId: number | null;
    onSelectCampaign: (id: number) => void;
};

type TabName = 'campaign' | 'players' | 'messages' | 'missions' | 'sessions' | 'army_rules' | 'campaign_rules';
const TABS: TabName[] = ['campaign', 'players', 'messages', 'missions', 'sessions', 'army_rules', 'campaign_rules'];

function Dashboard({
    selectedCampaignId,
    onSelectCampaign
}: Options) {
    const [activeTab, setActiveTab] = useState<TabName>('campaign');
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [notificationApi, contextHolder] = notification.useNotification();

    // Form state
    const [name, setName] = useState<string>('');
    const [expectedSessions, setExpectedSessions] = useState<number>(1);
    const [config, setConfig] = useState<string>('{}');

    const loadData = async () => {
        if (!selectedCampaignId) {
            setCampaign(null);
            return;
        }

        setLoading(true);
        try {
            const fetchedCampaign = await api.getCampaign(selectedCampaignId);
            setCampaign(fetchedCampaign);
            setName(fetchedCampaign.name);
            setExpectedSessions(fetchedCampaign.expectedSessions);
            setConfig(
                typeof fetchedCampaign.config === 'string'
                    ? fetchedCampaign.config
                    : JSON.stringify(fetchedCampaign.config ?? {}, null, 2)
            );
        } catch (error: any) {
            console.error('Failed to load campaign:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedCampaignId]);

    const tabItems = useMemo(() => {
        const tabs: TabsProps['items'] = TABS.map((tab) => {
            const label = tab === 'army_rules' ? 'Army Rules' : tab === 'campaign_rules' ? 'Campaign Rules' : tab.charAt(0).toUpperCase() + tab.slice(1);
            return { key: tab, label };
        });
        return tabs;
    }, []);

    /* Callbacks */
    const notify = useCallback((type: NotificationType, title: string, description?: string) => {
        notificationApi[type]({
            message: title,
            description,
            placement: 'bottomRight',
        });
    }, [notificationApi]);

    const onTabChange = useCallback((activeKey: string) => {
        setActiveTab(activeKey as TabName);
    }, []);

    const handleSaveCampaignDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCampaignId) return;

        try {
            let parsedConfig = {};
            try {
                parsedConfig = JSON.parse(config);
            } catch (err: any) {
                notify('error', 'Invalid JSON', 'Configuration must be a valid JSON object.');
                return;
            }

            const updated = await api.updateCampaignDetails(selectedCampaignId, {
                name: name.trim(),
                expectedSessions,
                config: JSON.stringify(parsedConfig),
            });
            
            setCampaign(updated);
            notify('success', 'Campaign Updated', 'The campaign details were updated successfully.');
        } catch (error: any) {
            console.error('Failed to update campaign:', error);
            notify('error', 'Failed to update campaign', error.message || String(error));
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {contextHolder}
            <Sider width={300} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
                <CampaignSidebar 
                    onSelectCampaign={onSelectCampaign} 
                    selectedCampaignId={selectedCampaignId} 
                />
            </Sider>
            <Content style={{ padding: '24px', overflowY: 'auto' }}>
                {!selectedCampaignId ? (
                    <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Empty 
                            description={<Text type="secondary" style={{ fontSize: '18px' }}>Select a Campaign from the sidebar or create a new one.</Text>} 
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </div>
                ) : loading || !campaign ? (
                    <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Text>Loading campaign...</Text>
                    </div>
                ) : (
                    <Card style={{ maxWidth: 1024, margin: '0 auto' }}>
                        <Title level={2} style={{ marginTop: 0 }}>{escapeHtml(campaign.name)}</Title>
                        <Space direction="horizontal" size="large" style={{ marginBottom: 24 }}>
                            <Text type="secondary"><strong>ID:</strong> {campaign.id}</Text>
                            <Text type="secondary"><strong>Created:</strong> {formatDate(campaign.created_at)}</Text>
                        </Space>

                        <Tabs activeKey={activeTab} items={tabItems} onChange={onTabChange} />

                        <section className={`tab-panel ${activeTab === 'campaign' ? '' : 'is-hidden'}`} data-panel="campaign" style={{ display: activeTab === 'campaign' ? 'block' : 'none' }}>
                            <form id="campaign-details-form" className="details-form" onSubmit={handleSaveCampaignDetails}>
                                <div style={{ marginBottom: 16 }}>
                                    <label htmlFor="edit-campaign-name" style={{ display: 'block', marginBottom: 8 }}>Name</label>
                                    <input 
                                        id="edit-campaign-name" 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        required 
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                    />
                                </div>
                                
                                <div style={{ marginBottom: 16 }}>
                                    <label htmlFor="edit-campaign-expected-sessions" style={{ display: 'block', marginBottom: 8 }}>Expected sessions</label>
                                    <input 
                                        id="edit-campaign-expected-sessions" 
                                        type="number" 
                                        min="1" 
                                        step="1" 
                                        value={expectedSessions} 
                                        onChange={(e) => setExpectedSessions(Number(e.target.value))} 
                                        required 
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                    />
                                </div>
                                
                                <div style={{ marginBottom: 16 }}>
                                    <label htmlFor="edit-campaign-config" style={{ display: 'block', marginBottom: 8 }}>Config (JSON object)</label>
                                    <textarea 
                                        id="edit-campaign-config" 
                                        rows={5} 
                                        value={config} 
                                        onChange={(e) => setConfig(e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}
                                    ></textarea>
                                </div>
                                
                                <Button type="primary" htmlType="submit">Save changes</Button>
                            </form>
                        </section>

                        <div style={{ display: activeTab === 'players' ? 'block' : 'none' }}>
                            <PlayerTab campaignId={selectedCampaignId} notify={notify} />
                        </div>

                        <div style={{ display: activeTab === 'messages' ? 'block' : 'none' }}>
                            <MessagesTab campaignId={selectedCampaignId} notify={notify} />
                        </div>

                        <div style={{ display: activeTab === 'missions' ? 'block' : 'none' }}>
                            <MissionsTab campaignId={selectedCampaignId} notify={notify} />
                        </div>

                        <div style={{ display: activeTab === 'sessions' ? 'block' : 'none' }}>
                            <SessionsTab campaignId={selectedCampaignId} notify={notify} />
                        </div>

                        <div style={{ display: activeTab === 'army_rules' ? 'block' : 'none' }}>
                            <ArmyRulesTab campaignId={selectedCampaignId} notify={notify} />
                        </div>

                        <div style={{ display: activeTab === 'campaign_rules' ? 'block' : 'none' }}>
                            <CampaignRulesTab campaignId={selectedCampaignId} notify={notify} />
                        </div>
                    </Card>
                )}
            </Content>
        </Layout>
    );
}

export default Dashboard;