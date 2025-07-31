import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { useMockedUser } from 'src/auth/hooks';

import { getMessage } from './utils/get-message';

export function ChatMessageItem({ message, participants, onOpenLightbox }) {
  const { user } = useMockedUser();

  const { me, hasImage } = getMessage({
    message,
    participants,
    currentUserId: user?.id,
  });

  const { content } = message;

  if (!content) return null;

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: me ? 'flex-end' : 'flex-start',
        mb: 3,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="flex-start"
        sx={{
          maxWidth: '768px',
          px: { xs: 2, md: 3 },
        }}
      >
        {/* Bulb icon only for user messages */}
        {me && (
          <Box sx={{ mt: '4px' }}>
            <Iconify icon="solar:bulb-bold" width={20} height={20} sx={{ color: 'primary.main' }} />
          </Box>
        )}

        {/* Message content */}
        <Box
          sx={{
            bgcolor: me ? 'primary.lighter' : 'transparent',
            px: me ? 2 : 0,
            py: me ? 1 : 0,
            borderRadius: me ? 1 : 0,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontSize: '1rem',
              lineHeight: 1.75,
              whiteSpace: 'pre-wrap',
              color: me ? 'grey.800' : 'text.primary', // ✅ Conditional text color
            }}
          >
            {hasImage ? (
              <Box
                component="img"
                alt="Attachment"
                src={content}
                onClick={() => onOpenLightbox(content)}
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  objectFit: 'cover',
                  '&:hover': { opacity: 0.9 },
                }}
              />
            ) : (
              content
            )}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
