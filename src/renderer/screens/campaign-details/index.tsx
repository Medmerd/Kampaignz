import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Empty, Steps, Tabs, TabsProps, Card, notification } from 'antd';
import { api } from '../../api';
import { escapeHtml, mount, queryRequired } from '../../utils/dom';
import { formatDate } from '../../utils/format';
import PlayerTab from './playerTab'
import MessagesTab from './messageTab';
import SessionsTab from './sessionsTab';
import StepsTab from './stepsTab';
import type { Campaign, Player, Message, Session, Step, NotificationType } from '../../types';

type Options = {
    campaignId: number;
    onBack: () => void;
};

type TabName = 'campaign' | 'players' | 'messages' | 'sessions' | 'steps';
const TABS: TabName[] = ['campaign', 'players', 'messages', 'sessions', 'steps'];


function CampaignDetails({
    campaignId,
    onBack
}: Options) {
    const [activeTab, setActiveTab] = useState<TabName>('campaign');
    const [campaign, setCampaign] = useState<Campaign>();
    const [players, setPlayers] = useState<Player[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [steps, setSteps] = useState<Step[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [notificationApi, contextHolder] = notification.useNotification();

    const loadData = async () => {
        const campaign = await api.getCampaign(campaignId);
        const players = await api.listPlayersByCampaign(campaignId);
        const messages = await api.listMessagesByCampaign(campaignId);
        const sessions = await api.listSessionsByCampaign(campaignId);
        const steps = await api.listStepsByCampaign(campaignId);

        setCampaign(campaign);
        setLoading(false)
    }

    useEffect(() => {
        loadData();
    }, [campaignId]);

    const tabItems = useMemo(() => {
        const tabs: TabsProps['items'] = TABS.map((tab) => {
            return { key: tab, label: tab };
        })
        return tabs;
    }, [TABS]);

    /* Callbacks */
    const notify = useCallback((type: NotificationType, title: string, description?: string) => {
        notificationApi[type]({
            title,
            description,
            placement: 'bottomRight',
        });
    }, [notificationApi]);
    const onBackClick: () => void = useCallback(() => {
        onBack();
    }, []);
    const onTabChange: (activeKey: string) => void = useCallback((activeKey: string) => {
        setActiveTab(activeKey as TabName);
    }, []);
    const onDetailsFormChange: () => void = useCallback(() => { }, []);


    if (loading) {
        return (<div>Loading...</div>);
    }

    return (
        <Card className="layout" style={{ maxWidth: 1024, margin: '20px auto' }}>
            {contextHolder}
            <button id="back-button" className="secondary-button" onClick={onBackClick}>Back to campaigns</button>
            <h1>{escapeHtml(campaign.name)}</h1>
            <p className="meta-row"><strong>ID:</strong> {campaign.id}</p>
            <p className="meta-row"><strong>Created:</strong> {formatDate(campaign.created_at)}</p>

            <div id="campaign-detail-tabs">
                <Tabs items={tabItems} onChange={onTabChange} />
            </div>

            <section className={`tab-panel, ${activeTab === 'campaign' ? '' : 'is-hidden'}`} data-panel="campaign">
                <form id="campaign-details-form" className="details-form" onChange={onDetailsFormChange}>
                    <label htmlFor="edit-campaign-name">Name</label>
                    <input id="edit-campaign-name" type="text" defaultValue={escapeHtml(campaign.name)} required />
                    <label htmlFor="edit-campaign-expected-sessions">Expected sessions</label>
                    <input id="edit-campaign-expected-sessions" type="number" min="1" step="1" defaultValue={campaign.expectedSessions} required />
                    <label htmlFor="edit-campaign-config">Config (JSON object)</label>
                    <textarea id="edit-campaign-config" rows={5} defaultValue={escapeHtml(JSON.stringify(campaign.config ?? {}, null, 2))}></textarea>
                    <button type="submit">Save changes</button>
                </form>
            </section>

            <section className={`tab-panel, ${activeTab === 'players' ? '' : 'is-hidden'}`} data-panel="campaign">
                <PlayerTab campaignId={campaignId} notify={notify} />
            </section>

            <section className={`tab-panel, ${activeTab === 'messages' ? '' : 'is-hidden'}`} data-panel="campaign">
                <MessagesTab campaignId={campaignId} notify={notify} />
            </section>

            <section className={`tab-panel, ${activeTab === 'sessions' ? '' : 'is-hidden'}`} data-panel="campaign">
                <SessionsTab campaignId={campaignId} notify={notify} />
            </section>

            <section className={`tab-panel, ${activeTab === 'steps' ? '' : 'is-hidden'}`} data-panel="campaign">
                <StepsTab campaignId={campaignId} notify={notify} />
            </section>
        </Card>
    );
}

export default CampaignDetails;