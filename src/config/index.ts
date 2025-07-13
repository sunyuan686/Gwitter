const isDev = process.env.NODE_ENV === 'development';

let config = {
  request: {
    token: ['9c48ed2297d7d9bf9447', '6de723dbf1a6e4adeacd'],
    clientID: isDev ? '56af6ab05592f0a2d399' : 'Ov23lijpnT0dgtKhkyca',
    clientSecret: isDev
      ? '5d7e71a1b6130001e84956420ca5b88bc45b7d3c'
      : 'e73b5bb12e937b16d4f9e8ff6470106e2298574f',
    pageSize: 6,
    autoProxy:
      'https://cors-anywhere.azm.workers.dev/https://github.com/login/oauth/access_token',
    owner: 'SimonAKing',
    repo: 'weibo',
  },

  app: {
    onlyShowOwner: false,
    enableRepoSwitcher: true,
    enableAbout: false,
    enableEgg: false,
  },
};

const gConfig = (window as any).GWITTER_CONFIG;

if (gConfig) {
  if (gConfig.request) {
    config.request = {
      ...config.request,
      ...gConfig.request,
    };
  }
  if (gConfig.app) {
    config.app = {
      ...config.app,
      ...gConfig.app,
    };
  }
}

export default config;
