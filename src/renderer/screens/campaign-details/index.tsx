import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Empty, Steps, Tabs, TabsProps, Card } from 'antd';
import { api } from '../../api';
import { escapeHtml, mount, queryRequired } from '../../utils/dom';
import { formatDate } from '../../utils/format';
import PlayerTab from './playerTab'
import MessagesTab from './messageTab';
import SessionsTab from './sessionsTab';
import StepsTab from './stepsTab';
import type { Router } from '../../router';
import type { Campaign, Player, Message, Session, Step } from '../../types';

type Options = {
    campaignId: number;
    onBack: () => void;
};

type TabName = 'campaign' | 'players' | 'messages' | 'sessions' | 'steps';
const TABS:TabName[] = ['campaign', 'players', 'messages', 'sessions', 'steps'];


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
            return {key: tab, label: tab};
        })
        return tabs;
    }, [TABS]);

    const onBackClick: () => void = useCallback(() => {
        onBack();
    }, []);
    const onTabChange: (activeKey: string) => void = useCallback((activeKey: string) => {
        setActiveTab(activeKey as TabName);
    }, []);
    const onDetailsFormChange: () => void = useCallback(() => {}, []);


    if (loading) {
        return (<div>Loading...</div>);
    }

    return (
        <Card className="layout" style={{ maxWidth: 1024, margin: '20px auto' }}>
            <button id="back-button" className="secondary-button" onClick={onBackClick}>Back to campaigns</button>
            <h1>{escapeHtml(campaign.name)}</h1>
            <p className="meta-row"><strong>ID:</strong> {campaign.id}</p>
            <p className="meta-row"><strong>Created:</strong> {formatDate(campaign.created_at)}</p>

            <div id="campaign-detail-tabs">
                <Tabs items={tabItems} onChange={onTabChange} />
            </div>

            <section className={ `tab-panel, ${activeTab === 'campaign' ? '' : 'is-hidden'}`} data-panel="campaign">
                <form id="campaign-details-form" className="details-form" onChange={onDetailsFormChange}>
                    <label htmlFor="edit-campaign-name">Name</label>
                    <input id="edit-campaign-name" type="text" value={escapeHtml(campaign.name)} required onChange={() => console.log("Changed")} />
                    <label htmlFor="edit-campaign-expected-sessions">Expected sessions</label>
                    <input id="edit-campaign-expected-sessions" type="number" min="1" step="1" value={campaign.expectedSessions} required onChange={() => console.log("Changed")}/>
                    <label htmlFor="edit-campaign-config">Config (JSON object)</label>
                    <textarea id="edit-campaign-config" rows={5} value={escapeHtml(JSON.stringify(campaign.config ?? {}, null, 2))} onChange={() => console.log("Changed")}></textarea>
                    <button type="submit">Save changes</button>
                </form>
            </section>

            <section className={ `tab-panel, ${activeTab === 'players' ? '' : 'is-hidden'}`} data-panel="campaign">
                <PlayerTab />
            </section>

            <section className={ `tab-panel, ${activeTab === 'messages' ? '' : 'is-hidden'}`} data-panel="campaign">
                <MessagesTab campaignId={campaignId} />
            </section>

            <section className={ `tab-panel, ${activeTab === 'sessions' ? '' : 'is-hidden'}`} data-panel="campaign">
                <SessionsTab />
            </section>

            <section className={ `tab-panel, ${activeTab === 'steps' ? '' : 'is-hidden'}`} data-panel="campaign">
                <StepsTab />
            </section>
        </Card>
    );
}

export default CampaignDetails;