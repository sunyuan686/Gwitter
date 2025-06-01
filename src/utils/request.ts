import axios from 'axios';
import config from '../config';

export const createAuthenticatedApi = (token: string) => {
  return axios.create({
    baseURL: 'https://api.github.com/',
    headers: {
      Accept: 'application/json',
      Authorization: `bearer ${token}`,
    },
  });
};

export const api = createAuthenticatedApi(config.token.join(''));

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
          reactions(first: 100) {
            totalCount
            nodes {
              content
              user {
                login
              }
            }
          }
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
  `;

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

// Get issue reactions
interface GetIssueReactionsParams {
  owner: string;
  repo: string;
  issueNumber: number;
}

export const getIssueReactionsQL = ({
  owner,
  repo,
  issueNumber,
}: GetIssueReactionsParams) => ({
  query: `
    query {
      repository(owner: "${owner}", name: "${repo}") {
        issue(number: ${issueNumber}) {
          reactions(first: 100) {
            totalCount
            nodes {
              content
              user {
                login
              }
            }
          }
        }
      }
    }
  `,
});

// Add reaction to issue
export const addReactionToIssue = async (
  authenticatedApi: any,
  subjectId: string,
  content: string,
) => {
  const mutation = `
    mutation AddReaction($subjectId: ID!, $content: ReactionContent!) {
      addReaction(input: {subjectId: $subjectId, content: $content}) {
        reaction {
          content
          user {
            login
          }
        }
      }
    }
  `;

  return authenticatedApi.post('/graphql', {
    query: mutation,
    variables: {
      subjectId,
      content,
    },
  });
};

// Remove reaction from issue
export const removeReactionFromIssue = async (
  authenticatedApi: any,
  subjectId: string,
  content: string,
) => {
  const mutation = `
    mutation RemoveReaction($subjectId: ID!, $content: ReactionContent!) {
      removeReaction(input: {subjectId: $subjectId, content: $content}) {
        reaction {
          content
          user {
            login
          }
        }
      }
    }
  `;

  return authenticatedApi.post('/graphql', {
    query: mutation,
    variables: {
      subjectId,
      content,
    },
  });
};

// Get issue comments
interface GetIssueCommentsParams {
  owner: string;
  repo: string;
  issueNumber: number;
}

export const getIssueCommentsQL = ({
  owner,
  repo,
  issueNumber,
}: GetIssueCommentsParams) => ({
  query: `
    query {
      repository(owner: "${owner}", name: "${repo}") {
        issue(number: ${issueNumber}) {
          comments(first: 100, orderBy: {field: CREATED_AT, direction: ASC}) {
            totalCount
            nodes {
              id
              author {
                login
                avatarUrl
              }
              bodyHTML
              createdAt
            }
          }
        }
      }
    }
  `,
});

// Add comment to issue
export const addCommentToIssue = async (
  authenticatedApi: any,
  subjectId: string,
  body: string,
) => {
  const mutation = `
    mutation AddComment($subjectId: ID!, $body: String!) {
      addComment(input: {subjectId: $subjectId, body: $body}) {
        commentEdge {
          node {
            id
            author {
              login
              avatarUrl
            }
            bodyHTML
            createdAt
          }
        }
      }
    }
  `;

  return authenticatedApi.post('/graphql', {
    query: mutation,
    variables: {
      subjectId,
      body,
    },
  });
};

export const getUserInfo = async (token: string) => {
  const response = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `bearer ${token}`,
    },
  });
  return response.data;
};

export const getAccessToken = async (code: string) => {
  const response = await axios.post(config.autoProxy, {
    client_id: config.clientID,
    client_secret: config.clientSecret,
    code,
  });
  return response.data;
};
