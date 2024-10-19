import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Aramid Finance Documentation',
  tagline: 'Secure and Efficient Cross-Chain Protocol',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.aramid.finance', // Update this with your Cloudflare Pages URL
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'AramidFinance', // Updated to match the GitHub organization name
  projectName: 'docs', // Updated to match the GitHub repository name

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/AramidFinance/docs/tree/main/', // Updated edit URL
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/aramid-social-card.jpg',
    navbar: {
      title: 'Aramid Finance',
      logo: {
        alt: 'Aramid Finance Logo',
        src: 'img/aramid-logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://aramid.finance',
          label: 'Homepage',
          position: 'right',
        },
        {
          href: 'https://app.aramid.finance',
          label: 'Bridge App',
          position: 'right',
        },
        {
          href: 'https://github.com/AramidFinance/docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: '📚 Getting Started',
              to: '/docs/intro',
            },
            {
              label: '🌐 Supported Networks',
              to: '/docs/supported-networks-and-assets',
            },
            {
              label: '🔗 Using Aramid Bridge',
              to: '/docs/using-aramid-bridge',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/gAku95M5TB',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/aramidfinance',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/AramidFinance/docs', // Updated GitHub link
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Aramid Finance. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
