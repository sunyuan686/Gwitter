import { GwitterConfig } from '../types/global';

/**
 * 获取环境变量配置
 * 优先使用环境变量，如果不存在则使用空字符串作为默认值
 */
function getEnvConfig() {
  return {
    token: [
      process.env.GWITTER_TOKEN_1 || '',
      process.env.GWITTER_TOKEN_2 || ''
    ].filter(token => token.length > 0), // 过滤掉空字符串
    clientID: process.env.GWITTER_CLIENT_ID || '',
    clientSecret: process.env.GWITTER_CLIENT_SECRET || '',
    autoProxy: process.env.GWITTER_AUTO_PROXY || 
      'https://cors-anywhere.azm.workers.dev/https://github.com/login/oauth/access_token',
    owner: process.env.GWITTER_OWNER || '',
    repo: process.env.GWITTER_REPO || '',
  };
}

/**
 * 默认配置
 * 敏感信息通过环境变量获取，避免硬编码
 */
let config = {
  request: {
    ...getEnvConfig(),
    pageSize: 6,
  },

  app: {
    onlyShowOwner: false,
    enableRepoSwitcher: true,
    enableAbout: false,
    enableEgg: false,
  },
};

/**
 * 设置配置
 * 允许运行时覆盖配置项
 * 
 * @param newConfig 新的配置项
 */
export function setConfig(newConfig: GwitterConfig) {
  if (newConfig.request) {
    config.request = {
      ...config.request,
      ...newConfig.request,
    };
  }

  if (newConfig.app) {
    config.app = {
      ...config.app,
      ...newConfig.app,
    };
  }
}

/**
 * 验证配置是否完整
 * 检查必需的环境变量是否已设置
 */
export function validateConfig() {
  const { request } = config;
  const missingFields = [];

  if (!request.clientID) missingFields.push('GWITTER_CLIENT_ID');
  if (!request.clientSecret) missingFields.push('GWITTER_CLIENT_SECRET');
  if (!request.owner) missingFields.push('GWITTER_OWNER');
  if (!request.repo) missingFields.push('GWITTER_REPO');
  if (!request.token || request.token.length === 0) {
    missingFields.push('GWITTER_TOKEN_1 and GWITTER_TOKEN_2');
  }

  if (missingFields.length > 0) {
    console.warn(
      'Missing required environment variables:',
      missingFields.join(', '),
      '\nPlease check your .env file or GitHub Actions secrets configuration.'
    );
  }

  return missingFields.length === 0;
}

export default config;
