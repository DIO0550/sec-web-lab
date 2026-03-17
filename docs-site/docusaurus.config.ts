import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'sec-web-lab Docs',
  tagline: 'Webセキュリティ ハンズオンラボ ドキュメント',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'http://localhost',
  baseUrl: '/',

  onBrokenLinks: 'throw',

  markdown: {
    format: 'md',
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'sec-web-lab Docs',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'ドキュメント',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: 'sec-web-lab — Webセキュリティ ハンズオンラボ',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'sql', 'json', 'diff', 'http'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
