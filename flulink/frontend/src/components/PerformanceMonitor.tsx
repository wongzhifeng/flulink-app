import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Statistic, Row, Col, Button, Select, DatePicker, message, Spin, Progress } from 'antd';
import { 
  DashboardOutlined, 
  ApiOutlined, 
  DatabaseOutlined, 
  ReloadOutlined,
  ClearOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import apiService from '../utils/apiService';
import './PerformanceMonitor.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface PerformanceReport {
  timestamp: string;
  operations: any[];
  apis: any[];
  cache: any;
  system: any;
  summary: {
    totalOperations: number;
    totalApiCalls: number;
    avgOperationDuration: number;
    cacheHitRate: number;
  };
}

interface SystemHealth {
  status: string;
  timestamp: string;
  uptime: number;
  memory: any;
  cache: any;
  services: any;
}

const PerformanceMonitor: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [timeRange, setTimeRange] = useState<[any, any] | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<string>('');

  // 获取性能报告
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/performance/report');
      if (response.data.success) {
        setReport(response.data.data);
      }
    } catch (error) {
      console.error('Fetch performance report error:', error);
      message.error('获取性能报告失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取健康状态
  const fetchHealth = useCallback(async () => {
    try {
      const response = await apiService.get('/performance/health');
      if (response.data.success) {
        setHealth(response.data.data);
      }
    } catch (error) {
      console.error('Fetch health error:', error);
      message.error('获取健康状态失败');
    }
  }, []);

  // 清理性能数据
  const cleanupData = async () => {
    try {
      const response = await apiService.post('/performance/cleanup');
      if (response.data.success) {
        message.success('性能数据清理完成');
        fetchReport();
      }
    } catch (error) {
      console.error('Cleanup data error:', error);
      message.error('清理性能数据失败');
    }
  };

  // 清空缓存
  const clearCache = async (category?: string) => {
    try {
      const response = await apiService.post('/performance/cache/clear', { category });
      if (response.data.success) {
        message.success('缓存清理完成');
        fetchReport();
      }
    } catch (error) {
      console.error('Clear cache error:', error);
      message.error('清理缓存失败');
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchReport();
    fetchHealth();
    
    // 每30秒刷新一次
    const interval = setInterval(() => {
      fetchHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchReport, fetchHealth]);

  // 操作统计表格列
  const operationColumns = [
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
    },
    {
      title: '调用次数',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: any, b: any) => a.count - b.count,
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate: number) => (
        <Progress 
          percent={Math.round(rate * 100)} 
          size="small" 
          status={rate > 0.95 ? 'success' : rate > 0.8 ? 'normal' : 'exception'}
        />
      ),
      sorter: (a: any, b: any) => a.successRate - b.successRate,
    },
    {
      title: '平均耗时(ms)',
      dataIndex: 'avgDuration',
      key: 'avgDuration',
      render: (duration: number) => duration.toFixed(2),
      sorter: (a: any, b: any) => a.avgDuration - b.avgDuration,
    },
    {
      title: 'P95耗时(ms)',
      dataIndex: 'p95Duration',
      key: 'p95Duration',
      render: (duration: number) => duration.toFixed(2),
      sorter: (a: any, b: any) => a.p95Duration - b.p95Duration,
    },
    {
      title: 'P99耗时(ms)',
      dataIndex: 'p99Duration',
      key: 'p99Duration',
      render: (duration: number) => duration.toFixed(2),
      sorter: (a: any, b: any) => a.p99Duration - b.p99Duration,
    },
  ];

  // API统计表格列
  const apiColumns = [
    {
      title: '端点',
      dataIndex: 'endpoint',
      key: 'endpoint',
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
    },
    {
      title: '调用次数',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: any, b: any) => a.count - b.count,
    },
    {
      title: '平均响应时间(ms)',
      dataIndex: 'avgResponseTime',
      key: 'avgResponseTime',
      render: (time: number) => time.toFixed(2),
      sorter: (a: any, b: any) => a.avgResponseTime - b.avgResponseTime,
    },
    {
      title: '最小响应时间(ms)',
      dataIndex: 'minResponseTime',
      key: 'minResponseTime',
      render: (time: number) => time.toFixed(2),
      sorter: (a: any, b: any) => a.minResponseTime - b.minResponseTime,
    },
    {
      title: '最大响应时间(ms)',
      dataIndex: 'maxResponseTime',
      key: 'maxResponseTime',
      render: (time: number) => time.toFixed(2),
      sorter: (a: any, b: any) => a.maxResponseTime - b.maxResponseTime,
    },
    {
      title: '状态码分布',
      dataIndex: 'statusCodes',
      key: 'statusCodes',
      render: (statusCodes: any) => (
        <div>
          {Object.entries(statusCodes).map(([code, count]) => (
            <span key={code} style={{ marginRight: '8px' }}>
              {code}: {count as number}
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="performance-monitor">
      <div className="monitor-header">
        <h2>
          <DashboardOutlined /> 性能监控面板
        </h2>
        <div className="header-actions">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchReport}
            loading={loading}
          >
            刷新
          </Button>
          <Button 
            icon={<ClearOutlined />} 
            onClick={cleanupData}
            danger
          >
            清理数据
          </Button>
        </div>
      </div>

      {/* 健康状态卡片 */}
      {health && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="系统状态"
                value={health.status}
                prefix={
                  health.status === 'healthy' ? 
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                }
                valueStyle={{ 
                  color: health.status === 'healthy' ? '#52c41a' : '#ff4d4f' 
                }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="运行时间"
                value={Math.floor(health.uptime / 3600)}
                suffix="小时"
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="内存使用率"
                value={health.memory?.heapUsedPercent?.toFixed(1) || 0}
                suffix="%"
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="缓存命中率"
                value={(health.cache?.hitRate * 100)?.toFixed(1) || 0}
                suffix="%"
                prefix={<FireOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 性能概览 */}
      {report && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总操作数"
                value={report.summary.totalOperations}
                prefix={<ApiOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="API调用数"
                value={report.summary.totalApiCalls}
                prefix={<ApiOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均操作耗时"
                value={report.summary.avgOperationDuration.toFixed(2)}
                suffix="ms"
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="缓存命中率"
                value={(report.summary.cacheHitRate * 100).toFixed(1)}
                suffix="%"
                prefix={<FireOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 操作统计 */}
      <Card title="操作性能统计" style={{ marginBottom: 16 }}>
        <div className="table-filters" style={{ marginBottom: 16 }}>
          <Select
            placeholder="选择操作"
            style={{ width: 200, marginRight: 16 }}
            value={selectedOperation}
            onChange={setSelectedOperation}
            allowClear
          >
            {report?.operations.map(op => (
              <Option key={op.operation} value={op.operation}>
                {op.operation}
              </Option>
            ))}
          </Select>
          <RangePicker
            placeholder={['开始时间', '结束时间']}
            onChange={setTimeRange}
          />
        </div>
        
        <Table
          columns={operationColumns}
          dataSource={report?.operations || []}
          rowKey="operation"
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>

      {/* API统计 */}
      <Card title="API性能统计" style={{ marginBottom: 16 }}>
        <Table
          columns={apiColumns}
          dataSource={report?.apis || []}
          rowKey={(record) => `${record.method}-${record.endpoint}`}
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>

      {/* 缓存统计 */}
      {report?.cache && (
        <Card title="缓存统计">
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="内存缓存大小"
                  value={report.cache.memoryCache.size}
                  prefix={<DatabaseOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="缓存配置数"
                  value={Object.keys(report.cache.configs || {}).length}
                  prefix={<FireOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'right', paddingTop: '16px' }}>
                <Button 
                  onClick={() => clearCache()}
                  danger
                  size="small"
                >
                  清空所有缓存
                </Button>
              </div>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default PerformanceMonitor;
