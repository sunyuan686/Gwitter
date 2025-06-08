import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../config';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils';
import {
  addCommentToIssue,
  api,
  createAuthenticatedApi,
  deleteComment,
  getIssueCommentsQL,
  updateComment,
} from '../utils/request';
import CommentInput from './CommentInput';

interface Comment {
  id: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  bodyHTML: string;
  createdAt: string;
  updatedAt?: string;
}

interface CommentListProps {
  issueNumber: number;
  issueId: string;
  isVisible: boolean;
  onCommentCountChange?: (count: number) => void;
}

const CommentsContainer = styled.div<{ isVisible: boolean }>`
  max-height: ${(props) => (props.isVisible ? '85vh' : '0')};
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-top: ${(props) => (props.isVisible ? '1px solid #e1e8ed' : 'none')};
  margin-top: ${(props) => (props.isVisible ? '16px' : '0')};
  background: white;
  will-change: max-height;
  contain: layout style;

  @media (max-width: 768px) {
    max-height: ${(props) => (props.isVisible ? '75vh' : '0')};
  }

  @media (max-width: 479px) {
    max-height: ${(props) => (props.isVisible ? '65vh' : '0')};
  }
`;

const CommentsContent = styled.div<{ isVisible: boolean }>`
  opacity: ${(props) => (props.isVisible ? '1' : '0')};
  transform: ${(props) => (props.isVisible ? 'translateY(0)' : 'translateY(-8px)')};
  transition:
    opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1) ${(props) => (props.isVisible ? '0.1s' : '0s')},
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) ${(props) => (props.isVisible ? '0.1s' : '0s')};
  will-change: opacity, transform;
  padding: 16px 0;
  contain: layout style;
`;

const CommentsScrollArea = styled.div`
  max-height: calc(85vh - 220px);
  overflow-y: auto;
  padding-right: 4px;
  /* padding-bottom: 12px; */

  @media (max-width: 768px) {
    max-height: calc(75vh - 200px);
    padding-bottom: 10px;
  }

  @media (max-width: 479px) {
    max-height: calc(65vh - 180px);
    padding-bottom: 8px;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d9e0;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #aab8c2;
  }
`;

const CommentItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f7f9fa;
  /* transition: background-color 0.2s ease; */

  &:hover {
    background-color: #f7f9fa;
    .markdown-body {
      background-color: #f7f9fa;
    }
  }

  &:last-child {
    border-bottom: none;
    margin-bottom: 4px;
  }
`;

const CommentAvatar = styled.img`
  width: 2em;
  height: 2em;
  border-radius: 50%;
  flex-shrink: 0;

  @media (max-width: 479px) {
    width: 1.5em;
    height: 1.5em;
  }
`;

const CommentContent = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
`;

const CommentAuthor = styled.span`
  font-weight: 700;
  color: #132850;
  font-size: 15px;

  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

const CommentDate = styled.span`
  color: #a1a1a1;
  text-shadow:
    #d9d9d9 0 0 1px,
    #fffffb 0 0 1px,
    #fffffb 0 0 2px;
  font-size: 0.9em;

  &::before {
    content: '·';
    margin: 0 4px;
  }
`;

const CommentBody = styled.div`
  color: #333;
  /* line-height: 1.3125; */
  word-wrap: break-word;
  margin-bottom: 12px;
  font-size: 1em;
  letter-spacing: 0.2px;

  &.markdown-body {
    font-size: 1em;
  }
`;

const CommentActions = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const MoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: transparent;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;
  opacity: 0;

  &:hover {
    background: #f7f9fa;
    color: #536471;
    opacity: 1;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// 更新CommentItem以包含MoreButton的悬停效果
const CommentItemWithHover = styled(CommentItem)`
  &:hover {
    background-color: #f7f9fa;
    .markdown-body {
      background-color: #f7f9fa;
    }

    .more-button {
      opacity: 1;
      color: #536471;
    }
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  min-width: 120px;
  opacity: ${(props) => (props.isOpen ? '1' : '0')};
  visibility: ${(props) => (props.isOpen ? 'visible' : 'hidden')};
  transform: ${(props) => (props.isOpen ? 'translateY(0)' : 'translateY(-8px)')};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
`;

const DropdownItem = styled.button<{ variant?: 'edit' | 'delete' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: none;
  border: none;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 0;

  &:first-child {
    border-radius: 12px 12px 0 0;
  }

  &:last-child {
    border-radius: 0 0 12px 12px;
  }

  &:only-child {
    border-radius: 12px;
  }

  ${(props) =>
    props.variant === 'edit'
      ? `
    color: #1d9bf0;
    &:hover {
      background: rgba(29, 155, 240, 0.1);
    }
  `
      : props.variant === 'delete'
        ? `
    color: #f4212e;
    &:hover {
      background: rgba(244, 33, 46, 0.1);
    }
  `
        : `
    color: #0f1419;
    &:hover {
      background: #f7f9fa;
    }
  `}

  svg {
    width: 16px;
    height: 16px;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  color: #657786;
  padding: 32px 20px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &::before {
    content: '';
    width: 16px;
    height: 16px;
    border: 2px solid #e1e8ed;
    border-top: 2px solid #1d9bf0;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const CommentInputWrapper = styled.div<{ isVisible: boolean }>`
  padding: 0 16px;
  padding-bottom: ${(props) => (props.isVisible ? '16px' : '0')};
  max-height: ${(props) => (props.isVisible ? '200px' : '0')};
  overflow: hidden;
  transition: max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: max-height;
  contain: layout;
`;

const UpdatedIndicator = styled.span`
  color: #536471;
  font-size: 13px;
  font-weight: 400;
  margin-left: 4px;
`;

const CommentList: React.FC<CommentListProps> = ({
  issueNumber,
  issueId,
  isVisible,
  onCommentCountChange,
}) => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && !loaded) {
      loadComments();
    }
  }, [isVisible, loaded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdownId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await api.post(
        '/graphql',
        getIssueCommentsQL({
          owner: config.owner,
          repo: config.repo,
          issueNumber,
        }),
      );

      const commentsData = response.data.data.repository.issue.comments.nodes;
      setComments(commentsData);
      setLoaded(true);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!isAuthenticated || !token) {
      throw new Error(t('interaction.loginRequired'));
    }

    try {
      const authenticatedApi = createAuthenticatedApi(token);
      const response = await addCommentToIssue(
        authenticatedApi,
        issueId,
        content,
      );

      const newComment = response.data.data.addComment.commentEdge.node;
      setComments((prev) => {
        const newComments = [...prev, newComment];
        onCommentCountChange?.(newComments.length);
        return newComments;
      });
    } catch (err) {
      console.error('Failed to add comment:', err);
      throw new Error(t('comments.addFailed'));
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    if (!isAuthenticated || !token) {
      throw new Error(t('interaction.loginRequired'));
    }

    try {
      const authenticatedApi = createAuthenticatedApi(token);
      const response = await updateComment(
        authenticatedApi,
        commentId,
        content,
      );

      const updatedComment = response.data.data.updateIssueComment.issueComment;
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? updatedComment : comment,
        ),
      );

      setEditingCommentId(null);
    } catch (err) {
      console.error('Failed to update comment:', err);
      throw new Error(t('comments.updateFailed'));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!isAuthenticated || !token) {
      return;
    }

    if (!confirm(t('comments.confirmDelete'))) {
      return;
    }

    try {
      const authenticatedApi = createAuthenticatedApi(token);
      await deleteComment(authenticatedApi, commentId);

      setComments((prev) => {
        const newComments = prev.filter((comment) => comment.id !== commentId);
        onCommentCountChange?.(newComments.length);
        return newComments;
      });
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const canEditComment = (comment: Comment) => {
    return isAuthenticated && user && comment.author.login === user.login;
  };

  const getCommentBodyText = (bodyHTML: string) => {
    const div = document.createElement('div');
    div.innerHTML = bodyHTML;
    return div.textContent || div.innerText || '';
  };

  return (
    <CommentsContainer isVisible={isVisible}>
      <CommentsContent isVisible={isVisible}>
        <CommentInputWrapper isVisible={isVisible}>
          <CommentInput
            onSubmit={handleAddComment}
            placeholder={t('comments.placeholder')}
            submitText={t('comments.add')}
          />
        </CommentInputWrapper>

        {loading && <LoadingText>{t('comments.loading')}</LoadingText>}

        {!loading && comments.length > 0 && (
          <CommentsScrollArea>
            {comments.map((comment) => {
              return (
                <CommentItemWithHover key={comment.id}>
                  <CommentAvatar
                    src={comment.author.avatarUrl}
                    alt={comment.author.login}
                  />
                  <CommentContent>
                    <CommentHeader>
                      <CommentAuthor>{comment.author.login}</CommentAuthor>
                      <CommentDate>
                        {formatDate(comment.createdAt, i18n.language)}
                      </CommentDate>
                      {comment.updatedAt &&
                        comment.updatedAt !== comment.createdAt && (
                          <UpdatedIndicator>
                            · {t('comments.edit')}
                          </UpdatedIndicator>
                        )}
                    </CommentHeader>

                    {editingCommentId === comment.id ? (
                      <CommentInput
                        onSubmit={(content) =>
                          handleUpdateComment(comment.id, content)
                        }
                        onCancel={() => setEditingCommentId(null)}
                        initialValue={getCommentBodyText(comment.bodyHTML)}
                        submitText={t('comments.save')}
                        showCancel={true}
                      />
                    ) : (
                      <>
                        <CommentBody
                          className="markdown-body"
                          dangerouslySetInnerHTML={{ __html: comment.bodyHTML }}
                        />

                        {canEditComment(comment) && (
                          <CommentActions>
                                                        <MoreButton
                              className="more-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(
                                  openDropdownId === comment.id ? null : comment.id
                                );
                              }}
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                              </svg>
                            </MoreButton>
                            <DropdownMenu isOpen={openDropdownId === comment.id}>
                              <DropdownItem
                                variant="edit"
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                </svg>
                                {t('comments.edit')}
                              </DropdownItem>
                              <DropdownItem
                                variant="delete"
                                onClick={() => {
                                  handleDeleteComment(comment.id);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                </svg>
                                {t('comments.delete')}
                              </DropdownItem>
                            </DropdownMenu>
                          </CommentActions>
                        )}
                      </>
                    )}
                  </CommentContent>
                </CommentItemWithHover>
              );
            })}
          </CommentsScrollArea>
        )}
      </CommentsContent>
    </CommentsContainer>
  );
};

export default CommentList;
