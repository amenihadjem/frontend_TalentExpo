// src/components/social-media-links.js
import { Box } from '@mui/material';

import {
  GithubIcon,
  TwitterIcon,
  LinkedinIcon,
  FacebookIcon,
  InstagramIcon,
} from 'src/assets/icons';

import { Iconify } from 'src/components/iconify';

// Helper function to normalize and build valid URLs
function getFullUrl(platform = '', rawUrl = '') {
  const url = rawUrl.trim();
  const platformKey = platform.trim().toLowerCase();

  // If the URL is already full, use it directly
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  // Clean up repeated domains (e.g., instagram.com/instagram.com/user)
  const cleanUrl = url.replace(
    /^.*?(linkedin\.com\/in\/|github\.com\/|twitter\.com\/|facebook\.com\/|instagram\.com\/)/i,
    ''
  );

  const baseUrls = {
    linkedin: 'https://linkedin.com/in/',
    github: 'https://github.com/',
    twitter: 'https://twitter.com/',
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
  };

  // Use known base or fallback
  const base = baseUrls[platformKey] || 'https://';

  return base + cleanUrl.replace(/^\/+/, '');
}

export function SocialMediaLinks({ social_media }) {
  const knownIcons = {
    linkedin: <LinkedinIcon width={20} height={20} style={{ verticalAlign: 'bottom' }} />,
    twitter: <TwitterIcon width={20} height={20} style={{ verticalAlign: 'bottom' }} />,
    facebook: <FacebookIcon width={20} height={20} style={{ verticalAlign: 'bottom' }} />,
    github: <GithubIcon width={20} height={20} style={{ verticalAlign: 'bottom' }} />,
    instagram: <InstagramIcon width={20} height={20} style={{ verticalAlign: 'bottom' }} />,
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
      {social_media?.map((social) => {
        const platform = social.platform || '';
        const url = social.url || '';
        const normalizedPlatform = platform.toLowerCase();

        const IconComponent = knownIcons[normalizedPlatform] || (
          <Iconify
            icon="eva:link-fill"
            width={20}
            height={20}
            style={{ verticalAlign: 'bottom' }}
          />
        );

        return (
          <a
            key={url}
            href={getFullUrl(platform, url)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              margin: '0 8px',
              display: 'inline-flex',
              alignItems: 'center',
              height: '100%',
            }}
          >
            {IconComponent}
          </a>
        );
      })}
    </Box>
  );
}
