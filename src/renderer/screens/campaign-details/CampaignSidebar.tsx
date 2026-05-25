import React, { useEffect, useState } from 'react';
import { List, Form, Input, Button, Typography, message } from 'antd';
import { api } from '../../api';
import type { Campaign } from '../../types';
import { formatDate } from '../../utils/format';

const { Title, Text } = Typography;

interface CampaignSidebarProps {
  onSelectCampaign: (id: number) => void;
  selectedCampaignId?: number | null;
}

const test: string = import.meta.env.VITE_DB_CLIENT || 'none';

export default function CampaignSidebar({ onSelectCampaign, selectedCampaignId }: CampaignSidebarProps) {
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
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Title level={3} style={{ marginTop: 0 }}>Kampaignz</Title>
      <Text type="secondary" style={{ marginBottom: '20px', display: 'block' }}>Env: {test}</Text>

      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        style={{ marginBottom: 24 }}
      >
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Please input campaign name!' }]}
          style={{ marginBottom: '8px' }}
        >
          <Input placeholder="New campaign name" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" block>
            Create
          </Button>
        </Form.Item>
      </Form>

      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={campaigns}
        style={{ flex: 1, overflowY: 'auto' }}
        renderItem={(campaign) => {
          const isSelected = selectedCampaignId === campaign.id;
          return (
            <List.Item 
              style={{
                cursor: 'pointer',
                padding: '12px 16px',
                marginBottom: '8px',
                borderRadius: '8px',
                background: isSelected ? '#e6f4ff' : 'transparent',
                border: isSelected ? '1px solid #1677ff' : '1px solid transparent',
                transition: 'all 0.3s'
              }}
              onClick={() => onSelectCampaign(campaign.id)}
            >
              <List.Item.Meta
                title={
                  <Text strong={isSelected} style={{ color: isSelected ? '#1677ff' : 'inherit' }}>
                    {campaign.name}
                  </Text>
                }
                description={formatDate(campaign.created_at)}
              />
            </List.Item>
          );
        }}
      />
    </div>
  );
}
