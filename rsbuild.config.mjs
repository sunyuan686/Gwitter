import { defineConfig } from '@rsbuild/core';
import { pluginLess } from '@rsbuild/plugin-less';
import { pluginReact } from '@rsbuild/plugin-react';
import 'dotenv/config';

export default defineConfig({
  html: {
    template: './public/index.html',
  },
  plugins: [pluginReact(), pluginLess()],
  source: {
    define: {
      'process.env.GWITTER_CLIENT_ID': JSON.stringify(process.env.GWITTER_CLIENT_ID || ''),
      'process.env.GWITTER_CLIENT_SECRET': JSON.stringify(process.env.GWITTER_CLIENT_SECRET || ''),
      'process.env.GWITTER_TOKEN_1': JSON.stringify(process.env.GWITTER_TOKEN_1 || ''),
      'process.env.GWITTER_TOKEN_2': JSON.stringify(process.env.GWITTER_TOKEN_2 || ''),
      'process.env.GWITTER_AUTO_PROXY': JSON.stringify(process.env.GWITTER_AUTO_PROXY || ''),
      'process.env.GWITTER_OWNER': JSON.stringify(process.env.GWITTER_OWNER || ''),
      'process.env.GWITTER_REPO': JSON.stringify(process.env.GWITTER_REPO || ''),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
            },
          },
        },
        type: 'javascript/auto',
      },
      {
        test: /\.jsx$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'ecmascript',
                jsx: true,
              },
            },
          },
        },
        type: 'javascript/auto',
      },
      {
        test: /\.tsx$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
            },
          },
        },
        type: 'javascript/auto',
      },
    ],
  },
  output: {
    assetPrefix: '/Gwitter/',
  },
});
