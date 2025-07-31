import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

import { fToNow } from 'src/utils/format-time'; // Assuming you have this utility

/**
 * ChatConversationList Component
 * Displays a list of chat conversations.
 */
export function ChatConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  loading,
  error,
}) {
  const handleSelect = useCallback(
    (conversationId) => {
      if (onSelectConversation) {
        onSelectConversation(conversationId);
      }
    },
    [onSelectConversation]
  );

  return (
    <Stack
      sx={{ height: '100%', borderRight: (theme) => `solid 1px ${theme.vars.palette.divider}` }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Conversations</Typography>
      </Box>
      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {loading && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {error && (
          <Box sx={{ p: 2 }}>
            <Typography color="error.main">Error: {error}</Typography>
          </Box>
        )}

        {!loading && !error && conversations.length === 0 && (
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">No conversations yet.</Typography>
            <Typography variant="caption">Start a new chat!</Typography>
          </Box>
        )}

        {!loading && !error && conversations.length > 0 && (
          <List disablePadding>
            {conversations.map((conversation) => (
              <ListItemButton
                key={conversation._id}
                onClick={() => handleSelect(conversation._id)}
                selected={conversation._id === selectedConversationId}
                sx={{
                  py: 1.5,
                  px: 2,
                  bgcolor:
                    conversation._id === selectedConversationId ? 'action.selected' : 'transparent',
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" noWrap>
                      {conversation.title || `Chat with Agent`}
                    </Typography>
                  }
                  secondary={
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      sx={{ typography: 'caption', color: 'text.disabled' }}
                    >
                      <Box
                        component="span"
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {conversation.last_message_content || 'No messages'}
                      </Box>
                      {conversation.updatedAt && (
                        <>
                          <Box
                            sx={{
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              bgcolor: 'text.disabled',
                            }}
                          />
                          <Typography variant="caption">
                            {fToNow(conversation.updatedAt)}
                          </Typography>
                        </>
                      )}
                    </Stack>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
    </Stack>
  );
}

ChatConversationList.propTypes = {
  conversations: PropTypes.array,
  selectedConversationId: PropTypes.string,
  onSelectConversation: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string,
};
