import styled from '@emotion/styled';
import {
  IssueBody,
  IssueContainer,
  IssueContent,
  IssueFooter,
  IssueHeader,
} from './common/IssueLayout';

const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 3s infinite;
  border-radius: 4px;
  margin-bottom: 8px;

  @keyframes skeleton-loading {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
`;

const SkeletonAvatar = styled(SkeletonBase)`
  width: 2em;
  height: 2em;
  border-radius: 50%;
  margin-right: 0.5em;
  margin-bottom: 0;
  display: inline-flex;
  align-self: center;

  @media (max-width: 479px) {
    width: 1.5em;
    height: 1.5em;
    margin-right: 0.3em;
  }
`;

const SkeletonUsername = styled(SkeletonBase)`
  width: 120px;
  height: 20px;
  display: inline-flex;
  align-self: center;
  margin-bottom: 0;

  @media (max-width: 479px) {
    width: 90px;
    height: 18px;
  }
`;

const SkeletonDate = styled(SkeletonBase)`
  width: 80px;
  height: 16px;
  display: inline-flex;
  align-self: center;
  margin-bottom: 0;
  margin-left: 20px;

  @media (max-width: 479px) {
    width: 60px;
    height: 14px;
    margin-left: 10px;
  }
`;

const SkeletonLabel = styled(SkeletonBase)`
  width: 60px;
  height: 24px;
  position: absolute;
  right: 0;
  top: 0;

  @media (max-width: 479px) {
    width: 50px;
    height: 20px;
  }
`;

const SkeletonLine = styled(SkeletonBase)<{ width: string }>`
  height: 16px;
  margin-top: 12px;
  width: ${(props) => props.width};

  @media (max-width: 479px) {
    height: 14px;
    margin-top: 10px;
  }
`;

const SkeletonInteractions = styled(SkeletonBase)`
  width: 100px;
  height: 20px;
  margin-top: 16px;

  @media (max-width: 479px) {
    width: 80px;
    height: 18px;
    margin-top: 12px;
  }
`;

export const SkeletonCard = () => (
  <IssueContainer>
    <IssueContent>
      <IssueHeader>
        <SkeletonAvatar />
        <SkeletonUsername />
        <SkeletonDate />
        <SkeletonLabel />
      </IssueHeader>
      <IssueBody>
        <SkeletonLine width="95%" />
        <SkeletonLine width="85%" />
        <SkeletonLine width="75%" />
        <SkeletonLine width="65%" />
      </IssueBody>
      <IssueFooter>
        <SkeletonInteractions />
      </IssueFooter>
    </IssueContent>
  </IssueContainer>
);

export default SkeletonCard;
