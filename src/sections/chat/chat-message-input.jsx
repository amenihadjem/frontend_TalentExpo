import { useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types'; // Don't forget to import PropTypes

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { useMockedUser } from 'src/auth/hooks';

export function ChatMessageInput({
  disabled,
  recipients,
  onAddRecipients,
  selectedConversationId,
  onSendMessage,
  modelVersion,
  onModelVersionChange,
}) {
  const fileRef = useRef(null);
  const { user } = useMockedUser();
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState(null);
  const [recordingText, setRecordingText] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const theme = useTheme();

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);

  const handleChangeMessage = useCallback((event) => {
    setMessage(event.target.value);
  }, []);

  const handleSendMessage = useCallback(
    async (event) => {
      if (event.key !== 'Enter' || !message.trim()) return;

      if (onSendMessage) {
        onSendMessage(message.trim());
      }

      setMessage(''); // Clear after sending
    },
    [message, onSendMessage]
  );

  const handleModelToggle = useCallback(
    (event) => {
      onModelVersionChange(event.target.checked ? 'v2' : 'v1');
    },
    [onModelVersionChange]
  );

  const handleVoiceInput = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setOpenSnackbar(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setMessage('');
      setRecordingText('Recording...');
    };

    recognition.onend = () => {
      setIsRecording(false);
      setRecordingText('');
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setMessage(transcript);
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.start();
  }, []);

  const handleFocus = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordingText('');
    }
  };

  return (
    <>
      <InputBase
        name="chat-message"
        id="chat-message-input"
        value={message}
        onKeyUp={handleSendMessage}
        onChange={handleChangeMessage}
        placeholder={isRecording ? 'Recording...' : 'Type a message'}
        disabled={disabled}
        startAdornment={
          <IconButton>
            <Iconify icon="eva:smiling-face-fill" />
          </IconButton>
        }
        endAdornment={
          <Box
            sx={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              // No padding on this Box, let InputBase handle the overall right padding
            }}
          >
            {/* Model Version Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={modelVersion === 'v2'}
                  onChange={handleModelToggle}
                  color="primary"
                  size="small"
                  disabled={disabled}
                />
              }
              label={
                <Typography variant="body2" sx={{ ml: 0.5, whiteSpace: 'nowrap' }}>
                  {modelVersion.toUpperCase()}
                </Typography>
              }
              labelPlacement="end"
              sx={{
                mx: 0, // No horizontal margin
                // We'll manage spacing with InputBase's pr and perhaps individual icon margins
                '& .MuiFormControlLabel-label': {
                  lineHeight: 1,
                  fontSize: theme.typography.body2.fontSize,
                  color: 'text.primary',
                },
              }}
            />

            {!isRecording && (
              <>
                <IconButton onClick={handleAttach} disabled={disabled} sx={{ mr: 0 }}>
                  {' '}
                  {/* Ensure no right margin on icons */}
                  <Iconify icon="solar:gallery-add-bold" />
                </IconButton>
                <IconButton onClick={handleAttach} disabled={disabled} sx={{ mr: 0 }}>
                  {' '}
                  {/* Ensure no right margin on icons */}
                  <Iconify icon="eva:attach-2-fill" />
                </IconButton>
              </>
            )}
            <IconButton
              onClick={handleVoiceInput}
              disabled={disabled}
              sx={{
                animation: isRecording ? 'pulse 1s infinite' : 'none',
                transition: 'all 0.5s ease',
                mr: 0, // Ensure no right margin on this icon
              }}
            >
              <Iconify icon="solar:microphone-bold" />
            </IconButton>
            {/* Send button (always visible) */}
            <IconButton
              onClick={() => onSendMessage(message.trim())}
              disabled={disabled || !message.trim()}
              sx={{ mr: 0 }} // Ensure no right margin on the last icon
            >
              <Iconify icon="eva:paper-plane-fill" />
            </IconButton>
          </Box>
        }
        onFocus={handleFocus}
        sx={[
          (theme) => ({
            px: 1,
            height: 56,
            flexShrink: 0,
            borderTop: `solid 1px ${theme.vars.palette.divider}`,
            pr: 0, // THIS IS THE KEY CHANGE: Set padding-right of InputBase to 0
          }),
        ]}
      />

      {voiceMessage && !isRecording && (
        <Box sx={{ padding: '8px', borderRadius: '8px', backgroundColor: 'lightgray' }}>
          <span>{voiceMessage}</span>
        </Box>
      )}

      <input type="file" ref={fileRef} style={{ display: 'none' }} />

      {/* Snackbar for unsupported API */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="error">
          Speech Recognition API is not supported in this browser.
        </Alert>
      </Snackbar>

      {/* CSS for the pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.5);
              opacity: 0.7;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </>
  );
}

ChatMessageInput.propTypes = {
  disabled: PropTypes.bool,
  recipients: PropTypes.array,
  onAddRecipients: PropTypes.func,
  selectedConversationId: PropTypes.string,
  onSendMessage: PropTypes.func,
  modelVersion: PropTypes.oneOf(['v1', 'v2']).isRequired,
  onModelVersionChange: PropTypes.func.isRequired,
};
