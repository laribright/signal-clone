import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    username: v.string(),
    status: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
  })
    .index('by_email', ['email'])
    .index('by_clerkId', ['clerkId']),
  friend_requests: defineTable({
    sender: v.id('users'),
    receiver: v.id('users'),
  })
    .index('by_receiver', ['receiver'])
    .index('by_receiver_sender', ['receiver', 'sender']),
  contacts: defineTable({
    user1: v.id('users'),
    user2: v.id('users'),
    conversationId: v.id('conversations'),
  })
    .index('by_user1', ['user1'])
    .index('by_user2', ['user2'])
    .index('by_conversationId', ['conversationId']),
  conversations: defineTable({
    name: v.optional(v.string()),
    isGroup: v.boolean(),
    lastMessage: v.optional(v.id('messages')),
  }),
  conversation_members: defineTable({
    memberId: v.id('users'),
    conversationId: v.id('conversations'),
    lastSeenMessage: v.optional(v.id('messages')),
  })
    .index('by_memberId', ['memberId'])
    .index('by_conversationId', ['conversationId'])
    .index('by_memberId_conversationId', ['memberId', 'conversationId']),
  messages: defineTable({
    senderId: v.id('users'),
    conversationId: v.id('conversations'),
    type: v.string(),
    content: v.array(v.string()),
  }).index('by_conversationId', ['conversationId']),
});
