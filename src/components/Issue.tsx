import styled from '@emotion/styled';
import 'github-markdown-css/github-markdown.css';
import { useTranslation } from 'react-i18next';
import config from '../config';
import { formatDate, ProcessedIssue } from '../utils';
import Interaction from './Interaction';
import Label from './Label';
import {
  IssueBody,
  IssueContainer,
  IssueContent,
  IssueHeader,
} from './common/IssueLayout';

const Username = styled.span`
  font-weight: 700;
  font-size: 15px;
  color: #132850;
  text-decoration: none;
`;

const VerifiedBadge = styled.span`
  margin-left: 0.2em;
  display: inline-flex;
  align-items: center;
`;

const Badge = styled.svg`
  width: 20px;
  height: 20px;
  color: rgb(29, 155, 240);
  fill: rgb(29, 155, 240);
`;

const Separator = styled.span`
  margin: 0 4px;
  font-weight: 600;
  color: #a1a1a1;
  text-shadow:
    #d9d9d9 0 0 1px,
    #fffffb 0 0 1px,
    #fffffb 0 0 2px;
  font-size: 0.9em;

  @media (max-width: 479px) {
    margin: auto 0.2em;
  }
`;

const DateText = styled.span`
  color: #a1a1a1;
  text-shadow:
    #d9d9d9 0 0 1px,
    #fffffb 0 0 1px,
    #fffffb 0 0 2px;
  font-size: 0.9em;
`;

const UserAvatar = styled.img`
  width: 2em;
  height: 2em;
  border-radius: 50%;
  margin-right: 0.5em;
  @media (max-width: 479px) {
    width: 1.5em;
    height: 1.5em;
    margin-right: 0.3em;
  }
`;

const Issue = ({ issue }: { issue: ProcessedIssue }) => {
  const { i18n } = useTranslation();

  return (
    <IssueContainer>
      <IssueContent>
        <IssueHeader>
          <UserAvatar src={config.avatar} />
          <Username>{config.owner}</Username>
          <VerifiedBadge>
            <Badge viewBox="0 0 22 22">
              <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path>
            </Badge>
          </VerifiedBadge>
          <Separator>·</Separator>
          <DateText>{formatDate(issue.createdAt, i18n.language)}</DateText>
          <Label
            name={issue.label.name}
            color={issue.label.color}
            style={{
              position: 'absolute',
              right: 0,
            }}
          />
        </IssueHeader>
        <IssueBody
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: issue.bodyHTML }}
        />
        <Interaction
          id={issue.number}
          issueId={issue.id}
          reactions={issue.reactions}
          comments={{
            totalCount: issue.comments,
          }}
        />
      </IssueContent>
    </IssueContainer>
  );
};

export default Issue;
