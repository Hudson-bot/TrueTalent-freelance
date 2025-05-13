// In-memory database for testing
const users = [
  {
    _id: '6823703xxxxxxxxxxxxxxx', // Match the ID in error logs
    name: 'Test User',
    email: 'testuser@example.com',
    role: 'freelancer',
    profilePic: 'https://via.placeholder.com/150'
  },
  {
    _id: '6820dc9c0009e7ccecc8e837',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'client',
    profilePic: 'https://via.placeholder.com/150'
  },
  {
    _id: '6820dc9c0009e7ccecc8e838',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'freelancer',
    profilePic: 'https://via.placeholder.com/150'
  }
];

const conversations = [];
const messages = [];

// Mock models
const User = {
  find: () => ({
    select: () => ({
      sort: () => Promise.resolve(users)
    })
  }),
  findById: (id) => Promise.resolve(users.find(user => user._id === id) || null)
};

const Conversation = {
  find: (query) => ({
    populate: () => ({
      populate: () => ({
        sort: () => Promise.resolve([])
      })
    })
  }),
  findById: (id) => ({
    populate: () => ({
      populate: () => Promise.resolve(null)
    })
  }),
  findOne: () => ({
    populate: () => Promise.resolve(null)
  }),
  findByIdAndUpdate: () => Promise.resolve(null),
  prototype: {
    save: function() {
      conversations.push(this);
      return Promise.resolve(this);
    }
  }
};

function ConversationModel(data) {
  this._id = Math.random().toString(36).substring(2, 15);
  this.participants = data.participants;
  this.lastMessage = null;
  this.createdAt = new Date();
  this.updatedAt = new Date();
  this.save = Conversation.prototype.save;
}

const Message = {
  find: () => ({
    populate: () => ({
      sort: () => Promise.resolve([])
    })
  }),
  findById: () => ({
    populate: () => Promise.resolve(null)
  }),
  prototype: {
    save: function() {
      messages.push(this);
      return Promise.resolve(this);
    }
  }
};

function MessageModel(data) {
  this._id = Math.random().toString(36).substring(2, 15);
  this.conversationId = data.conversationId;
  this.senderId = data.senderId;
  this.content = data.content;
  this.senderRole = data.senderRole;
  this.createdAt = new Date();
  this.save = Message.prototype.save;
}

// Mock mongoose
const mongoose = {
  connect: () => Promise.resolve(),
  Schema: function() {
    return {
      index: () => {}
    };
  },
  model: (name) => {
    if (name === 'User') return User;
    if (name === 'Conversation') return ConversationModel;
    if (name === 'Message') return MessageModel;
    return null;
  }
};

module.exports = {
  mongoose,
  User,
  Conversation,
  Message
}; 