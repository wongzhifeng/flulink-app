import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Avatar, Tag, Space, List, Input } from 'antd'
import { ArrowLeftOutlined, HeartOutlined, CommentOutlined, ShareAltOutlined } from '@ant-design/icons'
import { useStarSeeds } from '../context/AppContext'

const { TextArea } = Input

const StarSeedDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { starSeeds } = useStarSeeds()

  const starSeed = starSeeds.find(seed => seed._id === id)

  if (!starSeed) {
    return (
      <div className="starseed-detail-page">
        <div className="starseed-container">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            style={{ marginBottom: 16 }}
          >
            返回星空
          </Button>
          <div>星种不存在</div>
        </div>
      </div>
    )
  }

  const handleLight = () => {
    // TODO: 实现点亮功能
    console.log('点亮星种:', starSeed._id)
  }

  const handleComment = () => {
    // TODO: 实现评论功能
    console.log('评论星种:', starSeed._id)
  }

  const handleShare = () => {
    // TODO: 实现分享功能
    console.log('分享星种:', starSeed._id)
  }

  return (
    <div className="starseed-detail-page">
      <div className="starseed-container">
        <div className="starseed-header">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            style={{ marginBottom: 16 }}
          >
            返回星空
          </Button>
          
          <Card className="starseed-card">
            <div className="starseed-content">
              {starSeed.content.text && (
                <div className="starseed-text">
                  {starSeed.content.text}
                </div>
              )}
              
              {starSeed.content.imageUrl && (
                <div className="starseed-image">
                  <img src={starSeed.content.imageUrl} alt="星种图片" />
                </div>
              )}
            </div>

            <div className="starseed-meta">
              <Space wrap>
                {starSeed.spectrum.map((tag) => (
                  <Tag key={tag} color="purple">
                    {tag}
                  </Tag>
                ))}
                <Tag color="gold">
                  光度: {starSeed.luminosity}
                </Tag>
                <Tag color="cyan">
                  传播路径: {starSeed.propagationPath.length} 个节点
                </Tag>
              </Space>
            </div>

            <div className="starseed-actions">
              <Space>
                <Button
                  icon={<HeartOutlined />}
                  onClick={handleLight}
                  type="primary"
                >
                  点亮 ({starSeed.propagationPath.filter(p => p.interactionType === 'light').length})
                </Button>
                <Button
                  icon={<CommentOutlined />}
                  onClick={handleComment}
                >
                  评论
                </Button>
                <Button
                  icon={<ShareAltOutlined />}
                  onClick={handleShare}
                >
                  分享
                </Button>
              </Space>
            </div>
          </Card>
        </div>

        <div className="starseed-interactions">
          <Card title="传播路径" className="propagation-card">
            <List
              dataSource={starSeed.propagationPath}
              renderItem={(node, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar>{index + 1}</Avatar>}
                    title={`用户 ${node.userId}`}
                    description={
                      <Space>
                        <Tag color="blue">{node.interactionType}</Tag>
                        <Tag color="green">
                          {new Date(node.timestamp).toLocaleString()}
                        </Tag>
                        <Tag color="orange">
                          地理层级: {node.geographicLevel}
                        </Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StarSeedDetail


