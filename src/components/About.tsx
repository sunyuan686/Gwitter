import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../config';
import '../lib/collapse.js';
import { api, getLabelsQL } from '../utils/request';
import './About.less';
import Label from './Label';

const banLabels = ['dependencies'];

interface Label {
  name: string;
  color: string;
}

type AboutProps = {
  owner: string;
  repo: string;
};

const About = ({ owner, repo }: AboutProps) => {
  const [labels, setLabels] = useState<Label[] | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    let makeMePretty = document.querySelector('.collapse');
    new Collapse(makeMePretty, { accordion: true }).init();

    const fetchLabels = async () => {
      try {
        const response = await api.post(
          '/graphql',
          getLabelsQL({ owner, repo }),
        );
        const fetchedLabels = response?.data?.data?.repository?.labels?.nodes;

        if (Array.isArray(fetchedLabels)) {
          const filteredLabels = fetchedLabels.filter(
            (label) => !banLabels.includes(label.name),
          );
          setLabels(filteredLabels);
        }
      } catch (error) {
        console.error('Failed to fetch labels:', error);
      }
    };

    fetchLabels();
  }, [owner, repo]);

  return (
    <div className="about-container collapse">
      <div className="about-title">{t('about.title')}</div>

      <details>
        <summary>{t('about.gwitter.title')}</summary>
        <div>
          <div className="details-styling">
            <p>{t('about.gwitter.description')}</p>
          </div>
        </div>
      </details>

      <details>
        <summary>{t('about.content.title')}</summary>
        <div>
          <div className="details-styling">
            <p>
              {t('about.content.categories', { count: labels?.length || 0 })}
            </p>
            <div>
              {labels?.map((label, index) => (
                <Label
                  style={{ margin: '6px' }}
                  name={label.name}
                  color={label.color}
                  key={index}
                />
              ))}
            </div>
          </div>
        </div>
      </details>

      <details>
        <summary>{t('about.subscription.title')}</summary>
        <div>
          <div className="details-styling">
            <ul>
              <li>
                <code>{t('about.subscription.watch')}</code>&nbsp;
                <a
                  href="https://github.com/SimonAKing/weibo"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('about.subscription.repo')}
                </a>
              </li>
              <li>
                <code>{t('about.subscription.join')}</code>&nbsp;
                <a
                  href="https://thinking.simonaking.com/#ru-kou"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('about.subscription.wechat')}
                </a>
              </li>
              <li>
                <code>{t('about.subscription.join')}</code>&nbsp;
                <a
                  href="https://t.me/Simon_AKing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('about.subscription.telegram')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </details>
    </div>
  );
};

export default About;
