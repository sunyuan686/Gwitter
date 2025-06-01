import axios from 'axios';
import config from '../config';

export const api = axios.create({
  baseURL: 'https://api.github.com/',
  headers: {
    Accept: 'application/json',
    Authorization: `bearer ${config.token.join('')}`,
  },
});

interface GetIssuesQLParams {
  owner: string;
  repo: string;
  cursor: string | null;
  pageSize: number;
}

export const getIssuesQL = (vars: GetIssuesQLParams) => {
  const ql = `
  query getIssues($owner: String!, $repo: String!, $cursor: String, $pageSize: Int!) {
    repository(owner: $owner, name: $repo) {
      issues(first: $pageSize, after: $cursor, orderBy: {field: CREATED_AT, direction: DESC}, filterBy: {createdBy: $owner, states: OPEN}) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          number
          createdAt
          bodyHTML
          comments(first: 1) {
            totalCount
          }
          labels(first: 1) {
            nodes {
              name
              color
            }
          }
        }
      }
    }
  }
  `

  if (vars.cursor === null) {
    Reflect.deleteProperty(vars, 'cursor');
  }

  return {
    operationName: 'getIssues',
    query: ql,
    variables: vars,
  };
};

interface GetLabelsParams {
  owner: string;
  repo: string;
}

export const getLabelsQL = ({ owner, repo }: GetLabelsParams) => ({
  query: `
    query {
      repository(owner: "${owner}", name: "${repo}") {
        labels(first: 100) {
          nodes {
            name
            color
          }
        }
      }
    }
  `,
});
