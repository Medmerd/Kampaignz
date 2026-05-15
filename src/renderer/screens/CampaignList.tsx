import React, { useEffect, useState } from 'react';
import { List, Form, Input, Button, Typography, message, Card } from 'antd';
import { api } from '../api';
import type { Campaign } from '../types';
import { formatDate } from '../utils/format';

const { Title, Text } = Typography;

interface CampaignListProps {
  onSelectCampaign: (id: number) => void;
}

export default function CampaignList({ onSelectCampaign }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await api.listCampaigns();
      setCampaigns(data);
    } catch (error) {
      message.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const onFinish = async (values: { name: string }) => {
    try {
      await api.createCampaign(values.name);
      form.resetFields();
      message.success('Campaign created');
      fetchCampaigns();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to create campaign');
    }
  };

  return (
    <Card className="layout" style={{ maxWidth: 800, margin: '20px auto' }}>
      <Title level={2}>Kampaignz</Title>
      
      <Form
        form={form}
        onFinish={onFinish}
        layout="inline"
        style={{ marginBottom: 24 }}
      >
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Please input campaign name!' }]}
          style={{ flex: 1 }}
        >
          <Input placeholder="New campaign name" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Form.Item>
      </Form>

      {
        campaigns.map((campaign) => {
          return (
            <li key={`row${campaign.id}`}>
              <button className={`link-button`} 
                  data-message-id={campaign.id}
                  onClick={() => onSelectCampaign(campaign.id)}>
                     {campaign.name}
              </button>
              <div className="date">{formatDate(campaign.created_at)}</div>
            </li>
          );
        })
      }
    </Card>
  );
}
