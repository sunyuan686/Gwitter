import styled from '@emotion/styled';
import 'github-markdown-css/github-markdown.css';
import { useTranslation } from 'react-i18next';
import config from '../config';
import { formatDate, ProcessedIssue } from '../utils';
import Label from './Label';
import {
  IssueBody,
  IssueContainer,
  IssueContent,
  IssueHeader,
} from './common/IssueLayout';

const Username = styled.span`
  font-weight: 600;
  font-size: 1em;
  color: #132850;
  text-decoration: none;
`;

const VerifiedBadge = styled.span`
  margin-left: 0.2em;
  display: inline-flex;
  align-items: center;
`;

const Badge = styled.svg`
  width: 1em;
  height: 1em;
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
            <Badge
              className="is-badge"
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m512 268c0 17.9-4.3 34.5-12.9 49.7s-20.1 27.1-34.6 35.4c.4 2.7.6 6.9.6 12.6 0 27.1-9.1 50.1-27.1 69.1-18.1 19.1-39.9 28.6-65.4 28.6-11.4 0-22.3-2.1-32.6-6.3-8 16.4-19.5 29.6-34.6 39.7-15 10.2-31.5 15.2-49.4 15.2-18.3 0-34.9-4.9-49.7-14.9-14.9-9.9-26.3-23.2-34.3-40-10.3 4.2-21.1 6.3-32.6 6.3-25.5 0-47.4-9.5-65.7-28.6-18.3-19-27.4-42.1-27.4-69.1 0-3 .4-7.2 1.1-12.6-14.5-8.4-26-20.2-34.6-35.4-8.5-15.2-12.8-31.8-12.8-49.7 0-19 4.8-36.5 14.3-52.3s22.3-27.5 38.3-35.1c-4.2-11.4-6.3-22.9-6.3-34.3 0-27 9.1-50.1 27.4-69.1s40.2-28.6 65.7-28.6c11.4 0 22.3 2.1 32.6 6.3 8-16.4 19.5-29.6 34.6-39.7 15-10.1 31.5-15.2 49.4-15.2s34.4 5.1 49.4 15.1c15 10.1 26.6 23.3 34.6 39.7 10.3-4.2 21.1-6.3 32.6-6.3 25.5 0 47.3 9.5 65.4 28.6s27.1 42.1 27.1 69.1c0 12.6-1.9 24-5.7 34.3 16 7.6 28.8 19.3 38.3 35.1 9.5 15.9 14.3 33.4 14.3 52.4zm-266.9 77.1 105.7-158.3c2.7-4.2 3.5-8.8 2.6-13.7-1-4.9-3.5-8.8-7.7-11.4-4.2-2.7-8.8-3.6-13.7-2.9-5 .8-9 3.2-12 7.4l-93.1 140-42.9-42.8c-3.8-3.8-8.2-5.6-13.1-5.4-5 .2-9.3 2-13.1 5.4-3.4 3.4-5.1 7.7-5.1 12.9 0 5.1 1.7 9.4 5.1 12.9l58.9 58.9 2.9 2.3c3.4 2.3 6.9 3.4 10.3 3.4 6.7-.1 11.8-2.9 15.2-8.7z"
                fill="#1da1f2"
              />
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
      </IssueContent>
    </IssueContainer>
  );
};

export default Issue;
