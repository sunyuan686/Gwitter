import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ReturnButton = styled.button`
  padding: 0.5em;
  border-radius: 0.5em;
  border: none;
  outline: none;
  background: #f9f9f9;
  transition: all 0.2s;
  display: block;
  width: 120px;
  text-align: center;
  margin: 0 auto;
  cursor: pointer;

  &:hover {
    background: #eaeaea;
  }
`;

const ReturnText = styled.span`
  color: #999;
  opacity: 0.8;
  font-size: 0.85em;
`;

const Return = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <ReturnButton onClick={() => navigate('/')}>
      <ReturnText>{t('return.home')}</ReturnText>
    </ReturnButton>
  );
};

export default Return;
