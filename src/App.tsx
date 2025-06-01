import styled from '@emotion/styled';
import { useCallback, useEffect, useRef, useState } from 'react';
import FlipMove from 'react-flip-move';
import About from './components/About';
import Egg from './components/Egg';
import Issue from './components/Issue';
import LoginButton from './components/LoginButton';
import SkeletonCard from './components/SkeletonCard';
import config from './config';
import { useThrottle } from './hooks';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ProcessedIssue, transformIssues } from './utils';
import { api, getIssuesQL } from './utils/request';

const Container = styled.div`
  box-sizing: border-box;
  * {
    box-sizing: border-box;
  }
`;

const IssuesContainer = styled.div`
  padding-top: 1.25em;
  letter-spacing: 1px;
`;

const App = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<ProcessedIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [rawIssuesData, setRawIssuesData] = useState<any[]>([]);

  const cursorRef = useRef<string | null>(null);
  const isLoadingRef = useRef(isLoading);
  const lastIssueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const getIssues = useCallback(async () => {
    console.log('getIssues called, isLoading:', isLoadingRef.current);
    try {
      const res = await api.post(
        '/graphql',
        getIssuesQL({
          owner: config.owner,
          repo: config.repo,
          cursor: cursorRef.current,
          pageSize: config.pageSize,
        }),
      );
      const data = res.data.data.repository.issues;
      const { hasNextPage: nextPage, endCursor } = data.pageInfo;

      if (!nextPage) {
        window.removeEventListener('scroll', handleScroll);
      }

      setHasNextPage(nextPage);
      cursorRef.current = endCursor;

      // 保存原始数据
      setRawIssuesData((prev) => [...prev, ...data.nodes]);

      setIssues((prev) => [
        ...prev,
        ...transformIssues(data.nodes, user?.login),
      ]);
      setIsLoading(false);
    } catch (err) {
      console.error('err:', err);
      setIsLoading(false);
    }
  }, [user?.login]);

  const handleLazyLoad = useCallback(() => {
    if (isLoadingRef.current) return;

    const clientHeight =
      window.innerHeight || document.documentElement.clientHeight;
    if (
      window.scrollY + config.offsetTop * clientHeight <
      (lastIssueRef.current?.offsetTop ?? 0)
    ) {
      return;
    }

    console.log('handleLazyLoad triggered, starting new load');
    setIsLoading(true);
    getIssues();
  }, [getIssues]);

  const handleScroll = useThrottle(handleLazyLoad, 200);

  useEffect(() => {
    console.log('App mounted, initializing data load');
    // 清空之前的数据
    setRawIssuesData([]);
    setIssues([]);
    cursorRef.current = null;

    getIssues();
    window.addEventListener('scroll', handleScroll, false);

    return () => {
      console.log('App unmounting, cleaning up listeners');
      window.removeEventListener('scroll', handleScroll);
    };
  }, [getIssues, handleScroll]);

  // 当用户登录状态改变时，重新处理已有的 issues
  useEffect(() => {
    if (rawIssuesData.length > 0) {
      setIssues(transformIssues(rawIssuesData, user?.login));
    }
  }, [user?.login, rawIssuesData]);

  return (
    <Container>
      <LoginButton />
      <About />
      {issues.length > 0 && (
        <>
          <IssuesContainer>
            <FlipMove
              appearAnimation="accordionVertical"
              enterAnimation="accordionVertical"
              leaveAnimation="accordionVertical"
            >
              {issues.map((issue, index) => (
                <div
                  ref={index === issues.length - 1 ? lastIssueRef : undefined}
                  key={`${issue.id}-${index}`}
                >
                  <Issue issue={issue} />
                </div>
              ))}
            </FlipMove>
          </IssuesContainer>
        </>
      )}
      {isLoading && (
        <IssuesContainer>
          <SkeletonCard />
          <SkeletonCard />
        </IssuesContainer>
      )}
      {!hasNextPage && <Egg />}
    </Container>
  );
};

const AppWithAuth = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default AppWithAuth;
