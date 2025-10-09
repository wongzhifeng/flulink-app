import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation/Navigation';
import StarSeedPublishForm from '../components/Publish/StarSeedPublishForm';
import { StarSeed } from '../types';

const PublishPage: React.FC = () => {
  const navigate = useNavigate();
  const [publishedStarSeed, setPublishedStarSeed] = useState<StarSeed | null>(null);

  const handlePublishSuccess = (starSeed: StarSeed) => {
    setPublishedStarSeed(starSeed);
    // 可以选择跳转到星种详情页或星空图谱
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="page-transition">
      <Navigation />
      <div className="publish-page-container">
        <div className="publish-page-content">
          <StarSeedPublishForm
            onSuccess={handlePublishSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default PublishPage;
