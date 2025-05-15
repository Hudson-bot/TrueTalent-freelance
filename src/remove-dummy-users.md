# Instructions to Remove Dummy Users from MessagesPage

To remove dummy users and only work with real API users, follow these steps:

## 1. Remove imports for dummy data
In `src/components/talent/MessagesPage.jsx`, remove these imports:
```javascript
import injectDummyMessages, { createDummyConversations } from '../../utils/dummyMessageData';
import '../../utils/mockApi'; // Import the mock API to initialize it
```

## 2. Remove dummy user initialization code
Remove the development mode initialization of dummy data:
```javascript
// Initialize user data for development mode if not present
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    if (!localStorage.getItem('userId')) {
      // Create a test user ID for development
      const testUserId = `user_${Date.now()}`;
      localStorage.setItem('userId', testUserId);
      
      // If token doesn't exist, create a dummy one
      if (!localStorage.getItem('token')) {
        localStorage.setItem('token', 'dev_token_123456');
      }
      
      console.log('Development mode: Created test user ID:', testUserId);
    }
  }
}, []);
```

## 3. Remove fallback dummy users in user fetch
In the `fetchUserData` function, remove this part:
```javascript
// Generate dummy users in development mode
if (process.env.NODE_ENV === 'development') {
  const dummyUsers = [
    { _id: 'user1', name: 'John Smith', role: 'client', isOnline: true },
    { _id: 'user2', name: 'Sarah Johnson', role: 'client', isOnline: false },
    { _id: 'user3', name: 'Michael Brown', role: 'client', isOnline: true },
    { _id: 'user4', name: 'Emily Davis', role: 'client', isOnline: false },
    { _id: 'user5', name: 'Robert Wilson', role: 'client', isOnline: true },
  ];
  console.log('Using dummy users data');
  setAllUsers(dummyUsers);
}
```

## 4. Remove dummy conversations creation
Replace this entire block:
```javascript
// If no conversations were loaded from the API or there was an error, use dummy data in development
if (!conversationsLoaded && process.env.NODE_ENV === 'development') {
  console.log('No conversations found or error loading. Using dummy data for development.');
  // Generate dummy conversations
  const dummyData = createDummyConversations(userId);
  processedConversations = dummyData;
}
```

with:
```javascript
// If no conversations were loaded, set empty array
if (!conversationsLoaded) {
  processedConversations = [];
}
```

## 5. Remove mock socket for development
Remove the entire mock socket creation block:
```javascript
// Initialize Socket.io connection or mock it in development mode
if (process.env.NODE_ENV === 'development') {
  // Create a mock socket for development
  console.log('Creating mock socket for development');
  
  socketRef.current = {
    // ... mock socket implementation ...
  };
  
  setSocketConnected(true);
  console.log('Mock socket connected successfully');
  
  // Add dummy data
  injectDummyMessages(socketRef, userId);
} else {
  // Real socket connection for production
  // ...
}
```

Replace it with just the real socket connection code:
```javascript
// Initialize Socket.io connection
socketRef.current = io('http://localhost:5000', {
  query: {
    userId,
    userRole: userResponse.data.role || 'client'
  },
  reconnection: true
});

// Socket connection events
socketRef.current.on('connect', () => {
  setSocketConnected(true);
  console.log('Socket connected successfully');
});

socketRef.current.on('disconnect', () => {
  setSocketConnected(false);
});
```

## 6. Remove dummy message generation in handleSendMessage
Remove this entire block:
```javascript
// For dummy conversations, simulate response after a delay
setTimeout(() => {
  const responseMessage = {
    _id: `msg_response_${Date.now()}`,
    conversationId: selectedChat._id,
    senderId: selectedChat.otherUser._id,
    senderName: selectedChat.otherUser.name,
    senderRole: 'client',
    content: generateRandomResponse(messageInput),
    createdAt: new Date().toISOString()
  };
  
  // Add to UI
  setMessages(prev => [...prev, responseMessage]);
  
  // Update conversation
  setConversations(prev => 
    prev.map(conv => 
      conv._id === selectedChat._id 
        ? { 
            ...conv, 
            lastMessage: { 
              content: responseMessage.content,
              createdAt: responseMessage.createdAt 
            } 
          } 
        : conv
    )
  );
  
  // Show typing indicator briefly
  setIsTyping(true);
  setTypingUser(selectedChat.otherUser.name);
  
  setTimeout(() => {
    setIsTyping(false);
  }, 2000);
  
}, 3000 + Math.random() * 5000); // Random delay between 3-8 seconds
```

## 7. Remove dummy conversation creation in startNewConversation
Remove this entire block:
```javascript
// In development mode, create a dummy conversation
if (process.env.NODE_ENV === 'development') {
  const dummyConversationId = `conv_${Date.now()}`;
  
  // Ensure user has all required fields
  const processedUser = {
    _id: selectedUser._id,
    name: selectedUser.name || 'Unknown User',
    role: selectedUser.role || 'client',
    title: selectedUser.title || '',
    profilePic: selectedUser.profilePic || null,
    isOnline: selectedUser.isOnline || false
  };
  
  const dummyConversation = {
    _id: dummyConversationId,
    otherUser: processedUser,
    lastMessage: { content: 'Start a conversation' },
    unread: 0,
    messages: [] // Initialize with empty messages array
  };
  
  // Add to conversations list
  setConversations(prev => [dummyConversation, ...prev]);
  
  // Select the new conversation
  setSelectedChat(dummyConversation);
  setMessages([]);
  setShowNewChatModal(false);
}
```

## 8. Remove checkDummyMessage in fetchMessages
Remove this entire block:
```javascript
// Check if this is a dummy conversation (with ID starting with 'conv_')
if (conversationId.startsWith('conv_')) {
  console.log('Fetching dummy messages for conversation:', conversationId);
  // Find the conversation in our existing conversations
  const dummyConv = conversations.find(conv => conv._id === conversationId);
  if (dummyConv && dummyConv.messages) {
    // Use the messages already in the conversation object
    setMessages(dummyConv.messages);
    
    // Mark as read by updating the conversation
    setConversations(prev => 
      prev.map(conv => 
        conv._id === conversationId 
          ? { ...conv, unread: 0 } 
          : conv
      )
    );
    return;
  }
}
```

## 9. Remove the generateRandomResponse function
Delete the entire `generateRandomResponse` function.

## 10. Delete mockApi.js file
Delete the file `src/utils/mockApi.js`.

## 11. Delete or modify dummyMessageData.js file
Delete the file `src/utils/dummyMessageData.js` or keep it only if it's used elsewhere.

After making these changes, the MessagesPage component will only work with real users from the API and not use any dummy data. 