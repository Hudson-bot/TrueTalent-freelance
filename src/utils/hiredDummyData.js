// Dummy data for hired section messages UI
const dummyProjects = [
  {
    _id: 'project1',
    title: 'E-commerce Website Redesign',
    client: {
      _id: 'client1',
      name: 'John Smith',
      role: 'client',
      isOnline: true,
      profilePic: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    status: 'in_progress',
    deadline: '2023-12-15',
    budget: '$2,500'
  },
  {
    _id: 'project2',
    title: 'Mobile App Development',
    client: {
      _id: 'client2',
      name: 'Emma Johnson',
      role: 'client',
      isOnline: false,
      profilePic: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    status: 'just_started',
    deadline: '2024-01-20',
    budget: '$4,800'
  },
  {
    _id: 'project3',
    title: 'Brand Identity Design',
    client: {
      _id: 'client3',
      name: 'Michael Chen',
      role: 'client',
      isOnline: true,
      profilePic: 'https://randomuser.me/api/portraits/men/45.jpg',
    },
    status: 'in_progress',
    deadline: '2023-11-30',
    budget: '$1,200'
  },
  {
    _id: 'project4',
    title: 'Content Marketing Strategy',
    client: {
      _id: 'client4',
      name: 'Sarah Wilson',
      role: 'client',
      isOnline: false,
      profilePic: 'https://randomuser.me/api/portraits/women/22.jpg',
    },
    status: 'near_completion',
    deadline: '2023-11-05',
    budget: '$3,000'
  }
];

// Project-specific messaging content
const getProjectMessages = (projectId, projectTitle, clientName) => {
  switch (projectId) {
    case 'project1': // E-commerce Website Redesign
      return [
        {
          content: `Hi there! I'm excited to work with you on the ${projectTitle} project.`,
          fromClient: false
        },
        {
          content: `Welcome aboard! We're looking forward to seeing your ideas for our website redesign.`,
          fromClient: true
        },
        {
          content: "I've reviewed your requirements and have some questions about the product catalog structure.",
          fromClient: false
        },
        {
          content: "Sure, what would you like to know specifically?",
          fromClient: true
        },
        {
          content: "Are you planning to keep the current category hierarchy or are you open to a complete restructuring?",
          fromClient: false
        },
        {
          content: "We're open to suggestions. The current structure isn't working well for our customers.",
          fromClient: true
        }
      ];
    
    case 'project2': // Mobile App Development
      return [
        {
          content: `Hello ${clientName}! I'm ready to start on the ${projectTitle}.`,
          fromClient: false
        },
        {
          content: "Great! We've been waiting to get this app off the ground.",
          fromClient: true
        },
        {
          content: "I've looked at the wireframes you provided. Do you have any preference for the tech stack?",
          fromClient: false
        },
        {
          content: "We were thinking React Native since we want both iOS and Android versions.",
          fromClient: true
        },
        {
          content: "Perfect, that's my specialty. I'll prepare a development roadmap for your review.",
          fromClient: false
        }
      ];
      
    case 'project3': // Brand Identity Design
      return [
        {
          content: `Hi ${clientName}, thanks for choosing me for your ${projectTitle} project!`,
          fromClient: false
        },
        {
          content: "Hi! We're excited to work with you on our brand refresh.",
          fromClient: true
        },
        {
          content: "I've reviewed your brand questionnaire. Your target audience is quite specific.",
          fromClient: false
        },
        {
          content: "Yes, we're trying to appeal to a younger demographic while keeping our core customers.",
          fromClient: true
        },
        {
          content: "I understand the challenge. I'll prepare some initial concept directions for you by Friday.",
          fromClient: false
        },
        {
          content: "Sounds great! Looking forward to seeing them.",
          fromClient: true
        }
      ];
      
    case 'project4': // Content Marketing Strategy
      return [
        {
          content: `Hello ${clientName}! I'm pleased to work on your ${projectTitle}.`,
          fromClient: false
        },
        {
          content: "Hi! We're looking forward to improving our content marketing efforts.",
          fromClient: true
        },
        {
          content: "I've analyzed your current content performance. There are some interesting opportunities.",
          fromClient: false
        },
        {
          content: "What kind of opportunities have you identified?",
          fromClient: true
        },
        {
          content: "Your audience engages well with how-to guides, but you're not publishing enough of them.",
          fromClient: false
        },
        {
          content: "That's interesting. We hadn't noticed that trend.",
          fromClient: true
        },
        {
          content: "I'm working on a complete content calendar that leverages these insights.",
          fromClient: false
        }
      ];
      
    default:
      return [
        {
          content: `Hello! I'm looking forward to working on this project with you.`,
          fromClient: false
        },
        {
          content: "Thanks for joining the project. Let's make something great together!",
          fromClient: true
        }
      ];
  }
};

// Create dummy conversations for hired projects
export const createHiredConversations = (userId) => {
  return dummyProjects.map((project, index) => {
    // Generate messages specific to this project
    const rawMessages = getProjectMessages(project._id, project.title, project.client.name);
    
    // Process messages into the right format
    const messages = rawMessages.map((msg, i) => ({
      _id: `msg_${project._id}_${i}`,
      conversationId: `conv_${project._id}`,
      senderId: msg.fromClient ? project.client._id : userId,
      senderName: msg.fromClient ? project.client.name : 'You',
      senderRole: msg.fromClient ? 'client' : 'freelancer',
      content: msg.content,
      createdAt: new Date(Date.now() - (rawMessages.length - i) * 3600000).toISOString(),
      read: msg.fromClient ? (Math.random() > 0.3) : true, // 70% chance client messages are read
    }));
    
    // Get latest message
    const lastMessage = messages[messages.length - 1];
    
    // Calculate unread count
    const unread = messages.filter(msg => msg.senderId === project.client._id && !msg.read).length;
    
    return {
      _id: `conv_${project._id}`,
      projectId: project._id,
      projectTitle: project.title,
      projectStatus: project.status,
      projectDeadline: project.deadline,
      projectBudget: project.budget,
      participants: [
        { 
          _id: userId, 
          role: 'freelancer',
          name: 'You (Freelancer)' 
        },
        { 
          _id: project.client._id, 
          role: 'client',
          name: project.client.name,
          profilePic: project.client.profilePic,
          isOnline: project.client.isOnline
        }
      ],
      lastMessage: {
        content: lastMessage.content,
        createdAt: lastMessage.createdAt
      },
      messages,
      unread,
      otherUser: {
        _id: project.client._id,
        name: project.client.name,
        role: 'client',
        profilePic: project.client.profilePic,
        isOnline: project.client.isOnline
      }
    };
  });
};

// Smart response generator for hired messages
export const getHiredResponse = (message, projectTitle) => {
  const lowercaseMessage = message.toLowerCase();
  
  // Project milestone/update related
  if (lowercaseMessage.includes('progress') || lowercaseMessage.includes('update') || 
      lowercaseMessage.includes('status')) {
    return `I'm happy to provide an update on the ${projectTitle} project. We're currently on track with the timeline and have completed about 60% of the planned deliverables. I'll share more detailed progress in our weekly report.`;
  }
  
  // Meeting/call related
  if (lowercaseMessage.includes('meeting') || lowercaseMessage.includes('call') || 
      lowercaseMessage.includes('discuss') || lowercaseMessage.includes('talk')) {
    return "I'm available for a call tomorrow between 1-5pm or Friday morning. Would either of those times work for you?";
  }
  
  // Feedback related
  if (lowercaseMessage.includes('feedback') || lowercaseMessage.includes('review') || 
      lowercaseMessage.includes('think') || lowercaseMessage.includes('opinion')) {
    return "Thank you for the feedback. I'll incorporate these suggestions in the next iteration and share a revised version with you by Thursday.";
  }
  
  // Deadline/timeline related
  if (lowercaseMessage.includes('deadline') || lowercaseMessage.includes('timeline') || 
      lowercaseMessage.includes('when') || lowercaseMessage.includes('complete')) {
    return "Based on our current progress, we're on track to meet the agreed deadline. I've allocated extra time for revisions just to be safe.";
  }
  
  // Payment/invoice related
  if (lowercaseMessage.includes('payment') || lowercaseMessage.includes('invoice') || 
      lowercaseMessage.includes('billing') || lowercaseMessage.includes('charge')) {
    return "I've just sent the invoice for the completed milestone. Please let me know if you need any clarification on the billing items.";
  }
  
  // Default responses for hired contexts
  const defaultResponses = [
    "I'll get started on this right away and share my progress with you.",
    "Thanks for the additional information. This helps clarify what you're looking for.",
    "I understand your requirements and will incorporate them into the current sprint.",
    "I've made note of these changes and will adjust the project plan accordingly.",
    "This is helpful context. I'll reflect these preferences in the next deliverable.",
    "I appreciate your prompt response. This will help us maintain our timeline.",
    "I'll research this further and come back to you with some options by tomorrow."
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

export default createHiredConversations; 