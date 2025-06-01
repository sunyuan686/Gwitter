import styled from '@emotion/styled';
import debounce from 'lodash/debounce';
import { forwardRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import {
  addReactionToIssue,
  createAuthenticatedApi,
  removeReactionFromIssue,
} from '../utils/request';
import CommentList from './CommentList';

interface InteractionProps {
  id: number;
  issueId: string; // GitHub node ID
  reactions: {
    totalCount: number;
    userReacted: boolean;
    heartCount: number;
  };
  comments: {
    totalCount: number;
  };
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  margin-left: -8px;
`;

const InteractionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #536471;
  background: none;
  border: none;
  padding: 8px 0px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 400;
  border-radius: 20px;
  min-width: 0;
  position: relative;
  width: 50px;

  span {
    font-size: 13px;
    transition: color 0.2s;
    min-width: 0;
    position: relative;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0);
    border: 0 solid black;
    box-sizing: border-box;
    display: inline;
    font: inherit;
    list-style: none;
    margin: 0px;
    padding: 0px;
    position: relative;
    text-align: inherit;
    text-decoration: none;
    white-space: inherit;
    word-wrap: break-word;
  }

  &.liked {
    .icon-container svg {
      color: #f91880;
      fill: #f91880;
    }

    span {
      color: #f91880;
    }

    .icon-container:hover {
      svg {
        color: #f91880;
        fill: #f91880;
      }

      &::before {
        background: rgba(249, 24, 128, 0.1);
      }
    }
  }
`;

const IconContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
    transition:
      color 0.2s,
      opacity 0.2s;
    position: relative;
    z-index: 1;
    fill: rgb(83, 100, 113);
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: transparent;
    transform: translate(-50%, -50%);
    transition: all 0.2s ease;
    z-index: 0;
  }

  &.like-icon:hover {
    svg {
      color: #f91880;
      fill: #f91880;
    }

    &::before {
      width: 36px;
      height: 36px;
      background: rgba(249, 24, 128, 0.1);
    }
  }

  &.comment-icon:hover {
    svg {
      color: #1d9bf0;
      fill: #1d9bf0;
    }

    &::before {
      width: 36px;
      height: 36px;
      background: rgba(29, 161, 242, 0.1);
    }
  }

  &.comment-active {
    svg {
      color: #1d9bf0;
      fill: #1d9bf0;
    }

    &::before {
      width: 36px;
      height: 36px;
      background: rgba(29, 161, 242, 0.1);
    }
  }
`;

const NumberContainer = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  overflow: hidden;
`;

const HeartIcon = forwardRef<SVGSVGElement, { filled?: boolean }>(
  ({ filled = false }, ref) => (
    <svg viewBox="0 0 24 24" ref={ref}>
      <g>
        {filled ? (
          <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
        ) : (
          <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
        )}
      </g>
    </svg>
  ),
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24">
    <g>
      <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
    </g>
  </svg>
);

const Interaction: React.FC<InteractionProps> = ({
  id,
  issueId,
  reactions,
  comments,
}) => {
  const { t } = useTranslation();
  const { isAuthenticated, token, login } = useAuth();

  const [heartCount, setHeartCount] = useState(reactions.heartCount);
  const [liked, setLiked] = useState(reactions.userReacted);
  const [showComments, setShowComments] = useState(false);

  const toggleLike = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    const wasLiked = liked;

    try {
      console.log('Toggle like for issue:', id, liked, token);

      const authenticatedApi = createAuthenticatedApi(token!);

      if (!liked) {
        await addReactionToIssue(authenticatedApi, issueId, 'HEART');
        setLiked(true);
        setHeartCount((prev) => prev + 1);
      } else {
        await removeReactionFromIssue(authenticatedApi, issueId, 'HEART');
        setLiked(false);
        setHeartCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      if (wasLiked) {
        setLiked(false);
        setHeartCount((prev) => prev - 1);
      } else {
        setLiked(true);
        setHeartCount((prev) => prev + 1);
      }
    }
  };

  const handleLike = debounce(toggleLike, 300);

  const handleComment = () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    setShowComments(!showComments);
  };

  useEffect(() => {
    setLiked(reactions.userReacted);
    setHeartCount(reactions.heartCount);
  }, [reactions.userReacted, reactions.heartCount]);

  return (
    <Container>
      <ButtonsContainer>
        <InteractionButton
          onClick={handleLike}
          className={`like-button ${liked ? 'liked' : ''}`}
          title={
            isAuthenticated
              ? liked
                ? t('interaction.liked')
                : t('interaction.like')
              : t('interaction.loginToLike')
          }
        >
          <IconContainer className={`icon-container like-icon`}>
            <HeartIcon filled={liked} />
          </IconContainer>
          <NumberContainer>
            <span>{heartCount > 0 ? heartCount : ''}</span>
          </NumberContainer>
        </InteractionButton>
        <InteractionButton
          onClick={handleComment}
          className={`comment-button ${showComments ? 'comment-active' : ''}`}
          title={
            isAuthenticated
              ? t('interaction.comment')
              : t('interaction.loginToComment')
          }
        >
          <IconContainer
            className={`icon-container comment-icon ${showComments ? 'comment-active' : ''}`}
          >
            <CommentIcon />
          </IconContainer>
          <span>{comments.totalCount > 0 ? comments.totalCount : ''}</span>
        </InteractionButton>
      </ButtonsContainer>

      <CommentList issueNumber={id} isVisible={showComments} />
    </Container>
  );
};

export default Interaction;
