import styled from '@emotion/styled';
import { balloons } from 'balloons-js';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  position: relative;
  width: 100%;
  margin-top: 3rem;
  @media (orientation: landscape) and (max-height: 500px) {
    margin-top: 0.8rem;

    .closing-message {
      padding: 0.8rem;
      margin: 0.8rem auto;
      transform: rotate(-1deg);
    }

    .code-block {
      max-height: 180px;
    }

    .button-container {
      margin-top: 0.6rem;
    }
  }
`;

const BalloonsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const ClosingMessage = styled.div`
  text-align: center;
  padding: clamp(1.2rem, 3vw, 2rem) clamp(0.8rem, 2vw, 1.5rem);
  margin: clamp(1.5rem, 4vw, 2.5rem) auto;
  width: 85%;
  max-width: 600px;
  border-radius: clamp(6px, 1.5vw, 12px);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 2;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transform: rotate(-3deg) perspective(800px);
  transform-style: preserve-3d;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0.5) 38%,
      rgba(255, 255, 255, 0.5) 40%,
      rgba(255, 255, 255, 0) 48%
    );
    background-size: 200% 100%;
    background-position: 100% 0;
    opacity: 0;
    transition:
      opacity 0.3s ease,
      transform 0.3s ease,
      background-position 1.5s ease;
    z-index: -1;
  }

  &:hover {
    transform: rotate(0deg) perspective(800px) translateY(-10px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);

    &:before {
      opacity: 1;
      background-position: -100% 0;
    }

    .code-block {
      transform: translateZ(20px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .button-container {
      transform: translateZ(30px);
    }
  }

  @media (max-width: 768px) {
    width: 90%;
    padding: 1.2rem 0.8rem;
    margin: 1.2rem auto;
    transform: rotate(-2deg);
  }

  @media (max-width: 480px) {
    width: 95%;
    padding: 1rem 0.7rem;
    margin: 0.8rem auto;
    border-radius: 8px;
    transform: rotate(-1deg);
  }
`;

const CodeBlock = styled.div`
  background: #282c34;
  color: #abb2bf;
  border-radius: 8px;
  padding: clamp(0.6rem, 1.5vw, 1rem);
  font-family: monospace;
  font-size: clamp(0.75rem, 1vw, 0.9rem);
  text-align: left;
  margin: 0 auto;
  width: 100%;
  max-width: 500px;
  overflow: auto;
  position: relative;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  @media (max-width: 768px) {
    max-width: 100%;
    border-radius: 6px;
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
    padding: 0.6rem 0.4rem;
    border-radius: 4px;
    max-height: 250px;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const CodeLine = styled.span<{ delay: number }>`
  display: block;
  line-height: 1.4;

  @media (max-width: 480px) {
    line-height: 1.3;
    margin-bottom: 0.2rem;
  }
`;

const Keyword = styled.span`
  color: #c678dd;
`;

const Function = styled.span`
  color: #61afef;
`;

const String = styled.span`
  color: #98c379;
`;

const Comment = styled.span`
  color: #7d8799;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: clamp(0.4rem, 1.5vw, 0.8rem);
  margin-top: clamp(0.8rem, 2vw, 1.2rem);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  @media (max-width: 480px) {
    flex-direction: column;
    width: 90%;
    margin: 0.8rem auto 0;
    gap: 0.4rem;
  }
`;

const Button = styled.button`
  padding: clamp(0.5rem, 1.2vw, 0.7rem) clamp(1.2rem, 2.5vw, 2rem);
  font-size: clamp(0.7rem, 0.9vw, 0.9rem);
  font-weight: 500;
  color: white;
  background-color: #ff5f6d;
  background: linear-gradient(to right, #ff5f6d, #ffc371);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(255, 95, 109, 0.4);
  margin: 0.4rem;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 7px 20px rgba(255, 95, 109, 0.5);

    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
      );
      animation: shine 1.5s ease-in-out;
    }
  }

  @keyframes shine {
    0% {
      left: -100%;
    }

    100% {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0) scale(1);
    box-shadow: 0 5px 15px rgba(255, 95, 109, 0.4);
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 768px) {
    padding: 0.6rem 1.5rem;
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    width: 100%;
    margin: 0.2rem 0;
    padding: 0.6rem 1rem;
    border-radius: 30px;
  }
`;

const Egg: React.FC = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const balloonsRef = useRef<HTMLDivElement>(null);

  const handleLaunch = () => {
    balloons();
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handleLaunch();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <Container ref={containerRef}>
      <BalloonsContainer ref={balloonsRef} />
      <ClosingMessage>
        <CodeBlock>
          <code>
            <CodeLine delay={0.1}>
              <Keyword>function</Keyword>
              <Function> sayGoodbye</Function>() {'{'}
            </CodeLine>
            <CodeLine delay={0.2}>
              &nbsp;&nbsp;
              <Keyword>const</Keyword> message =
              <String>"{t('egg.message')}"</String>;
            </CodeLine>
            <CodeLine delay={0.3}>
              &nbsp;&nbsp;
              <Keyword>const</Keyword> hope =<String>"{t('egg.hope')}"</String>;
            </CodeLine>
            <CodeLine delay={0.4}>
              &nbsp;&nbsp;
              <Function>console.log</Function>(message, hope);
            </CodeLine>
            <CodeLine delay={0.5}>
              &nbsp;&nbsp;
              <Comment>{t('egg.comment')}</Comment>
            </CodeLine>
            <CodeLine delay={0.6}>{'}'}</CodeLine>
            <CodeLine delay={0.7}>
              <Function>sayGoodbye</Function>();
            </CodeLine>
          </code>
        </CodeBlock>
        <ButtonContainer>
          <Button onClick={handleLaunch}>{t('egg.runCode')}</Button>
        </ButtonContainer>
      </ClosingMessage>
    </Container>
  );
};

export default Egg;
