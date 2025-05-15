// Clean version of user fetching without dummy users
async function fetchUsers() {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  
  try {
    // First try the messaging-specific endpoint
    const usersResponse = await axios.get(`http://localhost:5000/api/users/messaging`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Users API response:', usersResponse.data);
    
    // Filter out current user from the list and ensure proper format
    return Array.isArray(usersResponse.data) 
      ? usersResponse.data.filter(user => user && user._id !== userId)
      : [];
  } catch (usersError) {
    console.log('Error fetching users from messaging endpoint:', usersError);
    
    // Try fallback endpoint for users
    try {
      const fallbackResponse = await axios.get(`http://localhost:5000/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Fallback API response:', fallbackResponse.data);
      
      // Process and filter users
      return Array.isArray(fallbackResponse.data)
        ? fallbackResponse.data.filter(user => user && user._id !== userId)
        : [];
    } catch (fallbackError) {
      console.log('Error with fallback users endpoint:', fallbackError);
      return []; // Return empty array, no dummy users
    }
  }
}

// Clean version of conversation fetch without dummy data
async function fetchConversations() {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  
  try {
    // Try to fetch real conversations
    const conversationsResponse = await axios.get(`http://localhost:5000/api/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Process conversations to ensure consistent format
    return conversationsResponse.data.map(conv => {
      // Find the other user in the conversation
      const otherUser = conv.participants?.find(p => 
        p && p._id && p._id !== userId
      );
      
      return {
        ...conv,
        _id: conv._id || conv.id,
        otherUser: otherUser || { name: 'Unknown User', isOnline: false },
        lastMessage: conv.lastMessage || { content: 'Start a conversation' },
        unread: conv.unread || 0
      };
    });
  } catch (conversationError) {
    console.log('Error fetching conversations:', conversationError);
    return []; // Return empty array, no dummy conversations
  }
}

// Clean version of socket initialization
function initializeSocket(userId, userRole) {
  const socket = io('http://localhost:5000', {
    query: {
      userId,
      userRole
    },
    reconnection: true
  });
  
  return socket;
}

// Clean version of startNewConversation without dummy fallback
async function startNewConversation(selectedUser) {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  
  try {
    // Create new conversation through API
    const response = await axios.post(
      'http://localhost:5000/api/conversations',
      { participants: [userId, selectedUser._id] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const newConversation = response.data;
    
    // Ensure user has all required fields
    const processedUser = {
      _id: selectedUser._id,
      name: selectedUser.name || 'Unknown User',
      role: selectedUser.role || 'client',
      title: selectedUser.title || '',
      profilePic: selectedUser.profilePic || null,
      isOnline: selectedUser.isOnline || false
    };
    
    // Return processed conversation
    return {
      ...newConversation,
      _id: newConversation._id || newConversation.id,
      otherUser: processedUser,
      lastMessage: { content: 'Start a conversation' },
      unread: 0
    };
  } catch (error) {
    console.log('Error creating conversation:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

// Clean version of fetchMessages without dummy messages handling
async function fetchMessages(conversationId) {
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.get(`http://localhost:5000/api/messages/conversation/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Process messages to ensure consistent format
    let messagesData = [];
    
    if (Array.isArray(response.data)) {
      messagesData = response.data;
    } else if (response.data?.messages) {
      messagesData = response.data.messages;
    } else if (response.data?.data) {
      messagesData = response.data.data;
    }
    
    return messagesData
      .filter(msg => msg && (msg._id || msg.id))
      .map(msg => ({
        _id: msg._id || msg.id,
        senderId: msg.senderId || msg.sender || '',
        content: msg.content || msg.text || '',
        createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
        conversationId
      }));
  } catch (error) {
    console.log('Error fetching messages:', error);
    return []; // Return empty array, no dummy messages
  }
} 