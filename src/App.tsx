import styled from '@emotion/styled';
import { useCallback, useEffect, useRef, useState } from 'react';
import FlipMove from 'react-flip-move';
import About from './components/About';
import Egg from './components/Egg';
import Issue from './components/Issue';
import SkeletonCard from './components/SkeletonCard';
import Toolbar from './components/Toolbar';
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
  /* letter-spacing: 1px; */
`;

const App = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<ProcessedIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [rawIssuesData, setRawIssuesData] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const cursorRef = useRef<string | null>(null);
  const isLoadingRef = useRef(isLoading);
  const lastIssueRef = useRef<HTMLDivElement>(null);
  const currentUserRef = useRef(user?.login);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    currentUserRef.current = user?.login;
  }, [user?.login]);

  const loadIssues = useCallback(async () => {
    console.log('loadIssues called, isLoading:', isLoadingRef.current);
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

      setHasNextPage(nextPage);
      cursorRef.current = endCursor;

      // 保存原始数据
      setRawIssuesData((prev) => [...prev, ...data.nodes]);

      setIssues((prev) => [
        ...prev,
        ...transformIssues(data.nodes, currentUserRef.current),
      ]);
      setIsLoading(false);
    } catch (err) {
      console.error('err:', err);
      setIsLoading(false);
    }
  }, []);

  const handleLazyLoad = useCallback(() => {
    if (isLoadingRef.current || !hasNextPage) return;

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
    loadIssues();
  }, [loadIssues, hasNextPage]);

  const handleScroll = useThrottle(handleLazyLoad, 200);

  useEffect(() => {
    if (!isInitialized) {
      console.log('App mounted, initializing data load');
      loadIssues();
      setIsInitialized(true);
    }
  }, [isInitialized, loadIssues]);

  useEffect(() => {
    if (isInitialized && hasNextPage) {
      window.addEventListener('scroll', handleScroll, false);

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isInitialized, hasNextPage, handleScroll]);

  useEffect(() => {
    if (rawIssuesData.length > 0) {
      setIssues(transformIssues(rawIssuesData, user?.login));
    }
  }, [user?.login, rawIssuesData]);

  return (
    <Container>
      <Toolbar />
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
