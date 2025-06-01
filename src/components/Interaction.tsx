import { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';
import '../style/heart-animation.css';

interface InteractionProps {
  id: number;
  comments: {
    totalCount: number;
  };
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
`;

const InteractionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: color 0.2s;
  font-size: inherit;

  &:hover {
    color: #1da1f2;
  }

  svg {
    width: 20px;
    height: 20px;
  }

  &.is-issue-liked {
    color: #e02460;
  }
`;

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" />
  </svg>
);

const Interaction: React.FC<InteractionProps> = ({ id, comments }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const likeButtonRef = useRef<HTMLButtonElement>(null);
  const [reactions, setReactions] = useState(0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  const createParticles = useCallback(() => {
    if (!likeButtonRef.current) return;

    const button = likeButtonRef.current;
    const buttonRect = button.getBoundingClientRect();
    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;

    let container = document.querySelector('.heart-particles-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'heart-particles-container';
      document.body.appendChild(container);
    }

    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'heart-particle';
      particle.innerHTML = '❤';
      particle.style.color = '#e02460';
      particle.style.fontSize = `${Math.random() * 10 + 7}px`;
      particle.style.opacity = '1';
      particle.style.top = `${centerY}px`;
      particle.style.left = `${centerX}px`;

      const angle = Math.random() * Math.PI * 2;
      const distanceX = Math.random() * 90 + 20;
      const distanceY = Math.random() * 60 + 15;
      const duration = Math.random() * 1000 + 600;

      particle.style.transform = 'translateX(0) translateY(0) scale(1)';
      particle.style.transition = `all ${duration}ms ease-out`;

      container.appendChild(particle);

      setTimeout(() => {
        particle.style.transform = `translateX(${
          Math.cos(angle) * distanceX
        }px) translateY(${Math.sin(angle) * distanceY}px) scale(0)`;
        particle.style.opacity = '0';
      }, 10);

      setTimeout(() => {
        if (particle.parentNode === container) {
          container.removeChild(particle);
        }
        if (container.childNodes.length === 0 && container.parentNode === document.body) {
          document.body.removeChild(container);
        }
      }, duration + 100);
    }
  }, []);

  const toggleLike = useCallback(() => {
    setLiking(true);

    if (!liked) {
      setLiked(true);
      setReactions(prev => prev + 1);
      createParticles();
    } else {
      setLiked(false);
      setReactions(prev => prev - 1);
    }

    setTimeout(() => {
      setLiking(false);
    }, 800);
  }, [liked, createParticles]);

  const handleLike = debounce(toggleLike, 300);

  const handleComment = () => {
    window.scrollTo(0, 0);
    navigate(`/issues/${id}`);
  };

  useEffect(() => {
    return () => {
      const container = document.querySelector('.heart-particles-container');
      if (container && container.parentNode === document.body) {
        document.body.removeChild(container);
      }
    };
  }, []);

  return (
    <Container>
      <InteractionButton
        ref={likeButtonRef}
        onClick={handleLike}
        className={`${liking ? 'is-issue-like-animation' : ''} ${
          liked ? 'is-issue-liked' : ''
        }`}
      >
        <HeartIcon />
        <span>{reactions}</span>
      </InteractionButton>

      <InteractionButton onClick={handleComment}>
        <CommentIcon />
        <span>{comments.totalCount} {t('interaction.comments')}</span>
      </InteractionButton>
    </Container>
  );
};

export default Interaction;