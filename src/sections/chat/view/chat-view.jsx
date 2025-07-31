import io from 'socket.io-client';
import DOMPurify from 'dompurify';
import { useState, useEffect, startTransition, useCallback, useRef } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import axios, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { EmptyContent } from 'src/components/empty-content';

import { ChatLayout } from '../layout';
import { ChatMessageInput } from '../chat-message-input';

// Define the Socket.IO URL and API keys/signatures
const SOCKET_URL = 'https://eventii.me/';
const API_KEY = 'ak_d634b28501f2b080dbbd13565f7a705311ad2ef713402eac';
const API_SIGNATURE = 'sk_491df80cf50d1dab10943253d521633ab8e1d6108e7f71f3347ee01a2d8a600c';

// Helper for "bot is thinking" animation (3 pulsing dots)
const TypingDots = () => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '1.5em',
      '& span': {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        bgcolor: 'text.secondary',
        mx: '2px',
        animation: 'dot-pulse 1s infinite ease-in-out',
      },
      '& span:nth-of-type(1)': { animationDelay: '0s' },
      '& span:nth-of-type(2)': { animationDelay: '0.2s' },
      '& span:nth-of-type(3)': { animationDelay: '0.4s' },
      '@keyframes dot-pulse': {
        '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
        '50%': { transform: 'scale(1.2)', opacity: 1 },
      },
    }}
  >
    <span />
    <span />
    <span />
  </Box>
);

/**
 * ChatView Component
 * Manages the UI and logic for the chat interface.
 * Handles chat history, sending messages, displaying agent replies,
 * and managing WebSocket connection status.
 */
export function ChatView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedConversationId = searchParams.get('id');

  // --- WebSocket States & Refs ---
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [session, setSession] = useState(null);
  const [agentReplyChunk, setAgentReplyChunk] = useState('');
  const [agentReplyEnd, setAgentReplyEnd] = useState(null);
  const [wsError, setWsError] = useState(null);

  // --- User ID States ---
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

  // State to track if we've determined the auth token status (even if HttpOnly)
  const [hasAuthTokenBeenAttempted, setHasAuthTokenBeenAttempted] = useState(false);

  // --- Messages & UI States ---
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [currentAgentResponse, setCurrentAgentResponse] = useState('');
  const messageListRef = useRef(null);
  const hasFinalReplyBeenAdded = useRef(false);

  // --- History Pagination States ---
  const HISTORY_BATCH_SIZE = 4; // Number of messages to load per batch
  const [historyTotalMessages, setHistoryTotalMessages] = useState(0); // Total messages in conversation
  const [historyLoadedCount, setHistoryLoadedCount] = useState(0); // Count of messages currently in `messages` state that came from history + new ones
  const [historyTotalPages, setHistoryTotalPages] = useState(0); // Total pages in conversation (from API's pagination.pages)
  const [hasMoreHistory, setHasMoreHistory] = useState(true); // Are there more older messages to load?
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const prevScrollHeight = useRef(0); // To store scroll height before new messages are added for "Load More"
  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false); // State for "Jump to Present" button

  // Model Version State
  const [modelVersion, setModelVersion] = useState('v1');

  // --- WebSocket Event Emitters ---
  const emitEvent = useCallback(
    (eventName, payload) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit(eventName, payload);
        setWsError(null);
      } else {
        console.warn('Socket not connected. Cannot emit event:', eventName, payload);
        setWsError('Socket not connected or authentication failed. Please log in.');
      }
    },
    [isConnected]
  );

  const createSession = useCallback(() => {
    emitEvent('create_session');
  }, [emitEvent]);

  const sendMessage = useCallback(
    (payload) => {
      emitEvent('send_message', payload);
    },
    [emitEvent]
  );

  const getChatHistoryByPage = useCallback(
    async (sessionId, userId, page, limit) => {
      if (!sessionId || !userId) {
        console.error('Session ID or User ID is missing for fetching history.');
        setWsError('Missing session or user ID to load chat history.');
        return [];
      }
      if (isHistoryLoading) return []; // Prevent multiple simultaneous fetches

      setIsHistoryLoading(true);
      setWsError(null);

      try {
        // Store current scroll height BEFORE fetching new history
        // This is crucial for maintaining scroll position after prepending messages
        if (messageListRef.current) {
          prevScrollHeight.current = messageListRef.current.scrollHeight;
        }

        console.log(
          `Fetching chat history for session ${sessionId} and user ${userId}, page: ${page}, limit: ${limit}`
        );
        const response = await axios.get(endpoints.chat.conversation, {
          params: {
            session_id: sessionId,
            user_id: userId,
            page: page,
            limit: limit,
          },
        });
        console.log('Chat history fetched via HTTP (GET):', response.data);

        if (
          response.data &&
          response.data.success &&
          response.data.data &&
          Array.isArray(response.data.data.messages) &&
          response.data.data.pagination
        ) {
          const { messages: fetchedMessages, pagination } = response.data.data;
          const { total, pages } = pagination; // Use these to update our state

          // Always update total messages and total pages based on the latest response
          setHistoryTotalMessages(total);
          setHistoryTotalPages(pages); // The API's 'pages' count

          // Format new messages
          const newFormattedMessages = fetchedMessages
            .map((msg) => ({
              id: msg._id,
              content: msg.content,
              createdAt: msg.createdAt,
              senderId: msg.role === 'user' ? 'me' : 'bot',
            }))
            .reverse();

          // Prepend new messages to the existing list
          setMessages((prev) => [...newFormattedMessages, ...prev]);
          setHistoryLoadedCount((prev) => prev + newFormattedMessages.length);

          // Determine if there's more history.
          // If the requested page was 1, there's no more history to load.
          setHasMoreHistory(page > 1);

          return newFormattedMessages; // Return fetched messages for logging/debugging
        } else {
          console.error('Unexpected response structure for chat history:', response.data);
          setHasMoreHistory(false);
          setWsError('Failed to load chat history: Unexpected data format from API.');
          return [];
        }
      } catch (error) {
        console.error('Error fetching chat history via HTTP:', error);
        setHasMoreHistory(false);
        setWsError(
          `Failed to load chat history: ${error.response?.data?.message || error.message || 'Network error.'}`
        );
        return [];
      } finally {
        setIsHistoryLoading(false);
      }
    },
    [isHistoryLoading]
  );

  const handleLoadMoreHistory = useCallback(async () => {
    if (!selectedConversationId || !currentUserId || isHistoryLoading) {
      console.warn('Cannot load more history:', {
        selectedConversationId,
        currentUserId,
        isHistoryLoading,
      });
      return;
    }

    if (!hasMoreHistory && messages.length > 0) {
      console.log('No more history to load.');
      return;
    }

    setIsHistoryLoading(true);
    setWsError(null);

    try {
      let currentTotalPages = historyTotalPages;

      // STEP 1: If total pages is unknown (first load), fetch it
      if (currentTotalPages === 0) {
        console.log('Fetching total pages for initial load...');
        const totalResponse = await axios.get(endpoints.chat.conversation, {
          params: {
            session_id: selectedConversationId,
            user_id: currentUserId,
            page: 1, // Request first page to get total and pages info
            limit: 4, // Only need 1 message to get pagination data
          },
        });

        if (totalResponse.data?.success && totalResponse.data?.data?.pagination) {
          currentTotalPages = totalResponse.data.data.pagination.pages;
          setHistoryTotalMessages(totalResponse.data.data.pagination.total); // Also store total messages
          setHistoryTotalPages(currentTotalPages);
          console.log(`Initial fetch: Total pages found: ${currentTotalPages}`);
        } else {
          console.error('Failed to get total pages for history.');
          setWsError('Failed to load history: Could not get total pages.');
          setHasMoreHistory(false);
          setIsHistoryLoading(false);
          return;
        }
      }

      let targetPage;
      if (messages.length === 0) {
        // This is the *first* time "Load History" is clicked for a specific conversation.
        // We want the last page.
        targetPage = currentTotalPages;
        console.log(`First history load. Targeting last page: ${targetPage}`);
      } else {
        // Subsequent loads: Get the page *before* the currently loaded messages.
        const pagesAlreadyLoaded = Math.ceil(historyLoadedCount / HISTORY_BATCH_SIZE);
        targetPage = currentTotalPages - pagesAlreadyLoaded;
        console.log(
          `Subsequent load. Loaded messages: ${historyLoadedCount}, Pages already loaded: ${pagesAlreadyLoaded}. Targeting page: ${targetPage}`
        );
      }

      // Ensure we don't request a page less than 1
      targetPage = Math.max(1, targetPage);

      if (targetPage < 1) {
        // This means we've loaded all available history
        setHasMoreHistory(false);
        setIsHistoryLoading(false);
        return;
      }

      // STEP 3: Fetch the messages using the calculated page number
      await getChatHistoryByPage(
        selectedConversationId,
        currentUserId,
        targetPage,
        HISTORY_BATCH_SIZE
      );
    } catch (error) {
      console.error('Error in handleLoadMoreHistory:', error);
      setWsError(`Failed to load history: ${error.response?.data?.message || error.message}`);
      setHasMoreHistory(false);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [
    selectedConversationId,
    currentUserId,
    isHistoryLoading,
    messages.length,
    historyTotalMessages,
    historyLoadedCount,
    historyTotalPages,
    hasMoreHistory,
    getChatHistoryByPage,
  ]);

  // --- WebSocket Connection and Event Handling ---
  useEffect(() => {
    if (!hasAuthTokenBeenAttempted) {
      setHasAuthTokenBeenAttempted(true);
      console.log(
        "Attempting Socket.IO connection. Browser will send HttpOnly 'Authentication' cookie."
      );
    }

    if (!hasAuthTokenBeenAttempted || socketRef.current) {
      return;
    }

    const dynamicHeaders = {
      'x-api-key': API_KEY,
      'x-api-signature': API_SIGNATURE,
    };

    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 3,
      randomizationFactor: 0.5,
      extraHeaders: dynamicHeaders,
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setWsError(null);
      hasFinalReplyBeenAdded.current = false;
      setTyping(false);
      setCurrentAgentResponse('');
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      setSession(null);
      setWsError(`Disconnected: ${reason}`);
      hasFinalReplyBeenAdded.current = false;
      setTyping(false);
      setCurrentAgentResponse('');
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message, err.data);
      if (err.message.includes('xhr poll error') && err.message.includes('401')) {
        setWsError('Connection error: Authentication failed. Please log in again.');
      } else {
        setWsError(`Connection error: ${err.message}`);
      }
      setIsConnected(false);
      setTyping(false);
      setCurrentAgentResponse('');
    });

    socketRef.current.on('exception', (data) => {
      console.error('WebSocket exception:', data);
      setWsError(`Server exception: ${JSON.stringify(data)}`);
    });

    socketRef.current.on('session_created', (newSession) => {
      console.log('Session created:', newSession);
      setSession(newSession);
      hasFinalReplyBeenAdded.current = false;
      setTyping(false);
      setCurrentAgentResponse('');
      // Reset pagination for new session
      setHistoryTotalMessages(0);
      setHistoryLoadedCount(0);
      setHistoryTotalPages(0);
      setHasMoreHistory(true);
      setMessages([]); // Clear messages for new session
    });

    socketRef.current.on('agent_reply', (chunk) => {
      setTyping(true);
      setAgentReplyChunk(chunk); // Use state to trigger re-render and accumulation
    });

    socketRef.current.on('agent_reply_end', (data) => {
      console.log('Agent reply end:', data);
      setAgentReplyEnd(data);
    });

    socketRef.current.on('session_ended', (data) => {
      console.log('Session ended:', data);
      setSession(null);
      setMessages([]);
      setHistoryTotalMessages(0);
      setHistoryLoadedCount(0);
      setHistoryTotalPages(0);
      setHasMoreHistory(true);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [hasAuthTokenBeenAttempted]);

  // --- Fetch User ID from endpoints.auth.me ---
  useEffect(() => {
    const fetchUserId = async () => {
      setIsUserLoading(true);
      setUserError(null);
      try {
        const response = await axios.get(endpoints.auth.me);
        console.log('auth.me response:', response.data);
        if (response.data && response.data.data && response.data.data._id) {
          setCurrentUserId(response.data.data._id);
          console.log('User ID fetched:', response.data.data._id);
        } else {
          setUserError('User data or ID not found in response.');
          console.error('User data or ID not found in /api/auth/me response:', response.data);
          setCurrentUserId(null);
        }
      } catch (error) {
        console.error('Failed to fetch user ID:', error);
        setUserError(`Failed to fetch user ID: ${error.response?.data?.message || error.message}`);
        setCurrentUserId(null);
      } finally {
        setIsUserLoading(false);
      }
    };

    if (!currentUserId && !userError) {
      fetchUserId();
    }
  }, [currentUserId, userError]);

  // --- Session Management (Create new session if none selected) ---
  useEffect(() => {
    if (isConnected && currentUserId && !isUserLoading && !userError) {
      if (!selectedConversationId && !session) {
        const timer = setTimeout(() => {
          createSession();
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [
    isConnected,
    selectedConversationId,
    createSession,
    currentUserId,
    isUserLoading,
    userError,
    session,
  ]);

  // --- Update URL when new session created ---
  useEffect(() => {
    if (session?._id && session._id !== selectedConversationId) {
      startTransition(() => {
        router.replace(paths.dashboard.chat + `?id=${session._id}`);
      });
    }
  }, [session, selectedConversationId, router]);

  // Handle streamed agent reply chunks
  useEffect(() => {
    if (agentReplyChunk) {
      setCurrentAgentResponse((prev) => prev + agentReplyChunk);
      setAgentReplyChunk(''); // Clear chunk after processing
    }
  }, [agentReplyChunk]);

  // Handle end of agent reply stream
  useEffect(() => {
    if (agentReplyEnd && !hasFinalReplyBeenAdded.current) {
      setTyping(false);
      if (agentReplyEnd.accumulatedResponse) {
        const botReply = {
          id: String(Date.now()),
          content: agentReplyEnd.accumulatedResponse,
          createdAt: new Date().toISOString(),
          senderId: 'bot',
        };
        setMessages((prev) => [...prev, botReply]);
        setHistoryLoadedCount((prev) => prev + 1);
        setWsError(null);
        hasFinalReplyBeenAdded.current = true;
      } else if (agentReplyEnd.error) {
        const errorReply = {
          id: String(Date.now()),
          content: `Oops! Something went wrong: ${agentReplyEnd.error.message || 'Unknown error.'}`,
          createdAt: new Date().toISOString(),
          senderId: 'bot',
          isError: true,
        };
        setMessages((prev) => [...prev, errorReply]);
        setHistoryLoadedCount((prev) => prev + 1);
        setWsError(
          `Agent reply error: ${agentReplyEnd.error.message || JSON.stringify(agentReplyEnd.error)}`
        );
        hasFinalReplyBeenAdded.current = true;
      }
      setCurrentAgentResponse('');
      setAgentReplyEnd(null);
    }
  }, [agentReplyEnd]);

  // --- Scrolling Logic ---
  // 1. Maintain scroll position when history is loaded
  useEffect(() => {
    const chatContainer = messageListRef.current;
    // This effect runs after `isHistoryLoading` becomes false and `messages` state updates
    if (chatContainer && !isHistoryLoading && prevScrollHeight.current > 0) {
      const newScrollHeight = chatContainer.scrollHeight;
      const heightDiff = newScrollHeight - prevScrollHeight.current;
      if (heightDiff > 0) {
        // Only adjust if content actually expanded upwards
        chatContainer.scrollTop += heightDiff;
        console.log(`Scroll adjusted by ${heightDiff} after history load.`);
      }
      // Reset prevScrollHeight after adjustment so it doesn't interfere with other scrolls
      prevScrollHeight.current = 0;
    }
  }, [isHistoryLoading, messages.length]); // Depend on history loading finishing and messages updating

  // 2. Scroll to bottom for new messages (user/bot) or typing indicator
  const scrollToBottom = useCallback(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      setShowScrollToBottomButton(false); // Hide button once at bottom
      console.log('Scrolled to bottom.');
    }
  }, []);

  useEffect(() => {
    const chatContainer = messageListRef.current;
    if (chatContainer && !isHistoryLoading) {
      // Only scroll to bottom if not actively loading history
      // Check if the last message was a user message or if bot is typing
      // And ensure we are already close to the bottom to allow user to read history
      const isUserAtBottom =
        chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 100; // 100px buffer
      if (
        (messages.length > 0 &&
          messages[messages.length - 1]?.senderId === 'me' &&
          isUserAtBottom) ||
        (typing && isUserAtBottom)
      ) {
        scrollToBottom();
      }
    }
  }, [messages.length, typing, scrollToBottom, isHistoryLoading]);

  // 3. Toggle "Jump to Present" button visibility
  useEffect(() => {
    const chatContainer = messageListRef.current;
    if (chatContainer) {
      const handleScroll = () => {
        const isAtBottom =
          chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 100; // 100px buffer
        setShowScrollToBottomButton(!isAtBottom);
      };

      // Add event listener
      chatContainer.addEventListener('scroll', handleScroll);
      // Initial check (useful if content loads and fills up space)
      handleScroll();
      return () => {
        chatContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [messages.length, currentAgentResponse, typing, isHistoryLoading]); // Dependencies to re-evaluate scroll position if content changes

  // --- Send message handler ---
  const handleSendMessage = useCallback(
    async (newMessageContent) => {
      if (!selectedConversationId) {
        console.error('No session ID found. Cannot send message.');
        setWsError('No active conversation. Please start a new one.');
        return;
      }
      if (!currentUserId) {
        console.error('User ID not found. Cannot send message.');
        setWsError('User not authenticated. User ID is missing.');
        return;
      }

      const userMessage = {
        id: String(Date.now()),
        content: newMessageContent,
        createdAt: new Date().toISOString(),
        senderId: 'me',
      };

      setMessages((prev) => [...prev, userMessage]);
      setHistoryLoadedCount((prev) => prev + 1); // User message also adds to loaded count
      setTyping(true); // Start typing indicator
      setCurrentAgentResponse(''); // Reset accumulated response for new agent reply
      hasFinalReplyBeenAdded.current = false; // Reset flag for new exchange

      sendMessage({
        session_id: selectedConversationId,
        user_id: currentUserId,
        content: newMessageContent,
        type: 'json',
        version: modelVersion,
        html_prompt: true,
      });
    },
    [selectedConversationId, sendMessage, currentUserId, modelVersion]
  );

  // Display user loading/error messages if any
  const statusMessage = isUserLoading
    ? 'Loading user data...'
    : userError
      ? `User data error: ${userError}`
      : !currentUserId
        ? 'User ID is missing. Please log in.'
        : '';

  // --- Render logic for messages ---
  const messagesToDisplay = [...messages];

  // Helper function to extract HTML content
  const extractAndSanitizeHtml = useCallback((content) => {
    // Regex to find the first HTML div starting with <div style=...>, ignoring anything before it
    // This makes it robust against markdown code block indicators like ```html or ```
    const htmlMatch = content.match(/<div\s+style=["'][^"']*['"]>[\s\S]*<\/div>/i);
    if (htmlMatch && htmlMatch[0]) {
      // Use DOMPurify to sanitize the extracted HTML
      return DOMPurify.sanitize(htmlMatch[0]);
    }
    return null; // No valid HTML div found
  }, []);

  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <ChatLayout
        slots={{
          header: (
            <Typography variant="h6" sx={{ p: 2 }}>
              TalentAI Agent 🤖
            </Typography>
          ),
          main: (
            <Box
              sx={{
                flex: '1 1 auto',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              {/* Connection Status & User Loading Status */}
              {(!isConnected || isUserLoading || userError || !currentUserId || wsError) && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor:
                      userError || !currentUserId || wsError ? 'error.light' : 'warning.light',
                    color:
                      userError || !currentUserId || wsError
                        ? 'error.contrastText'
                        : 'warning.contrastText',
                    textAlign: 'center',
                  }}
                >
                  {statusMessage ||
                    (!hasAuthTokenBeenAttempted && 'Preparing authentication...') ||
                    (wsError && `Connection error: ${wsError}`) ||
                    `Connecting to AI Agent...`}
                </Box>
              )}

              {/* Chat Message List */}
              <Box
                sx={{ flexGrow: 1, overflowY: 'auto', p: 2, position: 'relative' }}
                ref={messageListRef}
              >
                {/* Load More History Button */}
                {selectedConversationId && hasMoreHistory && !isHistoryLoading && (
                  <Box sx={{ textAlign: 'center', my: 1 }}>
                    <Button
                      onClick={handleLoadMoreHistory}
                      disabled={isHistoryLoading || !currentUserId || !selectedConversationId}
                      variant="outlined"
                      size="small"
                    >
                      {messages.length === 0 ? 'Load Last History' : 'Load More History'}
                    </Button>
                  </Box>
                )}

                {/* History Loading Indicator */}
                {isHistoryLoading && (
                  <Box sx={{ textAlign: 'center', my: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      Loading history...
                    </Typography>
                  </Box>
                )}

                {messagesToDisplay.length > 0 ? (
                  <Box>
                    {messagesToDisplay.map((message) => {
                      const isMe = message.senderId === 'me';
                      const isBot = message.senderId === 'bot';

                      // Attempt to extract HTML content
                      const sanitizedHtml = isBot ? extractAndSanitizeHtml(message.content) : null;

                      return (
                        <Box
                          key={message.id}
                          sx={{
                            display: 'flex',
                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: '70%',
                              p: isMe ? 1.5 : 0,
                              borderRadius: 1,
                              bgcolor: isMe ? 'primary.main' : 'transparent',
                              color: isMe ? 'primary.contrastText' : 'text.primary',
                              ...(message.isError && {
                                bgcolor: 'error.main',
                                color: 'error.contrastText',
                              }),
                              // Apply specific styles for HTML content only when it's rich HTML
                              // These styles should apply to the container of the HTML, not the Typography
                              ...(isBot &&
                                sanitizedHtml && {
                                  '& table': {
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    mt: 1,
                                    mb: 1,
                                    color: 'inherit',
                                    overflowX: 'auto',
                                    display: 'block', // Allows horizontal scrolling for tables
                                  },
                                  '& th, & td': {
                                    border: '1px solid #444',
                                    padding: '10px',
                                    textAlign: 'left',
                                    color: 'inherit',
                                  },
                                  '& h3': {
                                    mt: 1,
                                    mb: 1,
                                    fontSize: '1.17em',
                                    color: 'inherit',
                                  },
                                  '& p': {
                                    mb: 1,
                                    color: 'inherit',
                                  },
                                  '& ul': {
                                    ml: 2,
                                    mb: 1,
                                    color: 'inherit',
                                  },
                                  '& li': {
                                    mb: 0.5,
                                    color: 'inherit',
                                  },
                                  // Ensure all nested elements inherit color if you want them to
                                  '& *': {
                                    color: 'inherit',
                                  },
                                }),
                            }}
                          >
                            {/* Conditional rendering based on whether HTML was extracted */}
                            {isBot && sanitizedHtml ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: sanitizedHtml,
                                }}
                                style={{
                                  margin: '0', // Reset any default div margin
                                  fontFamily: 'inherit',
                                }}
                              />
                            ) : (
                              <Typography variant="body2">{message.content}</Typography>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  // Show empty content only if no history is loading AND no messages
                  !isHistoryLoading && (
                    <EmptyContent
                      title="Welcome! 👋"
                      description="Click 'Load Last History' to start or send a message."
                    />
                  )
                )}

                {/* BOT TYPING INDICATOR */}
                {typing && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      mb: 2,
                      ml: '12px',
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: 'grey.200',
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <TypingDots />
                    </Box>
                  </Box>
                )}

                {/* Jump to Present Button */}
                {showScrollToBottomButton && (
                  <Box
                    sx={{
                      position: 'sticky',
                      bottom: 16,
                      left: '0',
                      right: '0',
                      mt: 2,
                      zIndex: 10,
                      textAlign: 'center',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Button
                      onClick={scrollToBottom}
                      variant="contained"
                      size="small"
                      sx={{
                        bgcolor: 'primary.dark',
                        color: 'primary.contrastText',
                        '&:hover': {
                          bgcolor: 'primary.main',
                        },
                      }}
                    >
                      Jump to Present
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Input */}
              <ChatMessageInput
                onSendMessage={handleSendMessage}
                modelVersion={modelVersion}
                onModelVersionChange={setModelVersion}
                disabled={
                  !isConnected ||
                  !selectedConversationId ||
                  typing ||
                  isUserLoading ||
                  userError ||
                  !currentUserId ||
                  !hasAuthTokenBeenAttempted
                }
              />
            </Box>
          ),
          details: null,
        }}
      />
    </DashboardContent>
  );
}
