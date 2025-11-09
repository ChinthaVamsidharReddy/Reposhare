# Chat Components

## Core Components

### ChatContext.js
- State management for all chat functionality
- WebSocket connection handling
- Message sending and receiving
- Typing indicators
- Unread count tracking

### ChatPage.js
- Full-screen chat interface
- Message display and input
- Integrated with all chat features

### MessageBubble.js
- Individual message rendering
- Sender info and timestamp
- Own vs other user styling

### TypingIndicator.js
- Animated typing indicator
- Shows user names

### MessagingWidget.js
- Floating chat widget
- Quick access to groups
- Unread badges

### ChatList.js
- List of available groups
- Last message preview
- Member count

## Feature Components

### GroupChatList.js
- Grid view of study groups
- Create new group modal
- Unread count display

### NotificationCenter.js
- Notification bell icon
- Unread notification list
- Dismiss notifications

### MessageSearch.js
- Search messages in group
- Dropdown results
- Timestamp display

### UserPresence.js
- Show online users
- User avatars
- Typing status

### MessageReactions.js
- Emoji reactions on messages
- Reaction picker
- Hover to show options

### FileShare.js
- File attachment support
- Multiple file selection
- File size display

### VoiceMessage.js
- Record voice messages
- Timer display
- Stop recording

### PinnedMessages.js
- Pin important messages
- Pinned messages panel
- Quick access

### GroupSettings.js
- Group configuration
- Notification settings
- Member management

## Usage

All components are integrated into ChatPage and Dashboard. They work together to provide a complete chat experience.

### Import Example
```javascript
import ChatPage from './components/chat/ChatPage';
import MessagingWidget from './components/chat/MessagingWidget';
```

### Features Included
- ✅ Real-time messaging
- ✅ Typing indicators
- ✅ Unread notifications
- ✅ Message search
- ✅ User presence
- ✅ Message reactions
- ✅ File sharing
- ✅ Voice messages
- ✅ Pinned messages
- ✅ Group settings
