import React from 'react';
import { Card, Tag, Typography, Space, Button } from 'antd';
import ReactMarkdown from 'react-markdown';
import type { Rule } from '../../types';

const { Title, Text } = Typography;

export type ArmyRuleCardProps = {
  rule: Rule;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  isNested?: boolean;
};

// Map rule categories to colors
const CATEGORY_COLORS: Record<string, string> = {
  'Army Rule': 'blue',
  'Detachment': 'geekblue',
  'Enhancement': 'purple',
  'Stratagem': 'magenta',
  'Crusade Rule': 'cyan',
  'Boarding Action': 'volcano',
  'Sub-Rule': 'gold',
  'Campaign Rule': 'green',
  'Mission Rule': 'orange',
};

const ArmyRuleCard: React.FC<ArmyRuleCardProps> = ({ rule, onEdit, onDelete, isNested = false }) => {
  const color = CATEGORY_COLORS[rule.rule_category] || 'default';
  
  let parsedMetadata: any = null;
  if (rule.metadata) {
    try {
      parsedMetadata = JSON.parse(rule.metadata);
    } catch (e) {
      // ignore
    }
  }

  // Use action bar if callbacks provided, else nothing
  const actions = [];
  if (onEdit) actions.push(<Button type="link" onClick={() => onEdit(rule.id)}>Edit</Button>);
  if (onDelete) actions.push(<Button type="link" danger onClick={() => onDelete(rule.id)}>Delete</Button>);

  return (
    <Card 
      className="army-rule-card"
      style={{ 
        marginBottom: 16, 
        borderLeft: `4px solid var(--ant-${color}-5, #1890ff)`, 
        boxShadow: isNested ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
        backgroundColor: isNested ? '#fafafa' : '#fff'
      }}
      styles={{ body: { padding: isNested ? '12px 16px' : '16px 20px' } }}
      actions={actions.length > 0 ? actions : undefined}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Space direction="vertical" size={0}>
          <Title level={isNested ? 5 : 4} style={{ margin: 0 }}>{rule.name}</Title>
          <Tag color={color} style={{ marginTop: 4 }}>{rule.rule_category}</Tag>
        </Space>
        {parsedMetadata && parsedMetadata.cost && (
          <Tag color="red" style={{ fontSize: 14, padding: '2px 8px', fontWeight: 'bold' }}>Cost: {parsedMetadata.cost}</Tag>
        )}
      </div>

      <div className="markdown-body" style={{ marginTop: 12, lineHeight: 1.6 }}>
        <ReactMarkdown>{rule.description}</ReactMarkdown>
      </div>

      {parsedMetadata && Object.keys(parsedMetadata).filter(k => k !== 'cost').length > 0 && (
        <div style={{ marginTop: 16, padding: 8, background: isNested ? '#f0f0f0' : '#fafafa', borderRadius: 4 }}>
          <Text type="secondary" strong>Metadata:</Text>
          <ul style={{ paddingLeft: 20, margin: '4px 0 0' }}>
            {Object.entries(parsedMetadata).filter(([k]) => k !== 'cost').map(([k, v]) => (
              <li key={k}><Text type="secondary">{k}: {String(v)}</Text></li>
            ))}
          </ul>
        </div>
      )}

      {rule.children && rule.children.length > 0 && (
        <div style={{ marginTop: 24, paddingLeft: 16, borderLeft: '2px dashed #d9d9d9' }}>
          {rule.children.map(child => (
            <ArmyRuleCard 
              key={child.id} 
              rule={child} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              isNested={true}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default ArmyRuleCard;
