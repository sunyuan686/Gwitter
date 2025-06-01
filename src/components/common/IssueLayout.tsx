import styled from '@emotion/styled';

export const IssueContainer = styled.div`
  position: relative;
  padding: 0.625em 0;
  display: flex;
`;

export const IssueContent = styled.div`
  flex: 1 1;
  padding: 1em 1.5em;
  overflow: auto;
  border-radius: 10px;
  background: hsla(0, 0%, 100%, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0.625em 2.5em 0 rgba(234, 234, 234, 0.8);
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: 0 1em 3em 0.5em rgba(200, 200, 200, 0.4);
    transform: translateY(-1px) scale(1.01);
  }

  @media (max-width: 479px) {
    padding: 0.625em 0.75em;
  }
`;

export const IssueHeader = styled.div`
  margin-bottom: 0.7em;
  font-size: 1em;
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  /* gap: 0.2em; */
`;

export const IssueBody = styled.div`
  color: #333;
  &.markdown-body {
    font-size: 1em;
    letter-spacing: 1px;
    ol {
      list-style: decimal !important;
    }
    ul {
      list-style: circle !important;
    }
  }
`;

export const IssueFooter = styled.div`
  position: relative;
  margin-top: 0.8em;
  font-size: 1em;
  user-select: none;
`;
