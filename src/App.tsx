import styled from '@emotion/styled';
import { useCallback, useEffect, useRef, useState } from 'react';
import FlipMove from 'react-flip-move';
import About from './components/About';
import Egg from './components/Egg';
import Issue from './components/Issue';
import SkeletonCard from './components/SkeletonCard';
import config from './config';
import { useThrottle } from './hooks';
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
  const [issues, setIssues] = useState<ProcessedIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(true);

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
      setIssues((prev) => [...prev, ...transformIssues(data.nodes)]);
      setIsLoading(false);
    } catch (err) {
      console.error('err:', err);
      setIsLoading(false);
    }
  }, []);

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
    getIssues();
    window.addEventListener('scroll', handleScroll, false);

    return () => {
      console.log('App unmounting, cleaning up listeners');
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Container>
      {issues.length > 0 && (
        <>
          <About />
          <IssuesContainer>
            <FlipMove
              appearAnimation="accordionVertical"
              enterAnimation="accordionVertical"
              leaveAnimation="accordionVertical"
            >
              {issues.map((issue, index) => (
                <div
                  ref={index === issues.length - 1 ? lastIssueRef : undefined}
                  key={`${issue.id}`}
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

export default App;
