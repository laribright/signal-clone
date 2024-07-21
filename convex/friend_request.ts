import { mutation } from './_generated/server';
import { v, ConvexError } from 'convex/values';
import { getUserDataById } from './_utils';

export const create = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) throw new ConvexError('Not authenticated');

    if (args.email === identity.email)
      throw new ConvexError('Cannot send friend request to yourself');

    const currentUser = await getUserDataById({
      ctx,
      clerkId: identity.subject,
    });

    if (!currentUser) throw new ConvexError('User not found');

    const receiver = await ctx.db
      .query('users')
      .withIndex('by_email', q => q.eq('email', args.email))
      .unique();

    if (!receiver) throw new ConvexError('Receiver not found');

    const requestAlreadyExists = await ctx.db
      .query('friend_requests')
      .withIndex('by_receiver_sender', q =>
        q.eq('receiver', receiver._id).eq('sender', currentUser._id)
      )
      .unique();

    if (requestAlreadyExists) throw new ConvexError('Request already exists');

    const requestAlreadyReceived = await ctx.db
      .query('friend_requests')
      .withIndex('by_receiver_sender', q =>
        q.eq('receiver', currentUser._id).eq('sender', receiver._id)
      )
      .unique();

    if (requestAlreadyReceived)
      throw new ConvexError('Request already received');

    const contacts1 = await ctx.db
      .query('contacts')
      .withIndex('by_user1', q => q.eq('user1', currentUser._id))
      .collect();

    const contacts2 = await ctx.db
      .query('contacts')
      .withIndex('by_user2', q => q.eq('user2', currentUser._id))
      .collect();

    if (
      contacts1.some(contact => contact.user2 === receiver._id) ||
      contacts2.some(contact => contact.user1 === receiver._id)
    ) {
      throw new ConvexError(`Already friends ${receiver.email}`);
    }

    const request = ctx.db.insert('friend_requests', {
      sender: currentUser._id,
      receiver: receiver._id,
    });

    return request;
  },
});

export const decline = mutation({
  args: {
    id: v.id('friend_requests'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) throw new ConvexError('Not authenticated');

    const currentUser = await getUserDataById({
      ctx,
      clerkId: identity.subject,
    });

    if (!currentUser) throw new ConvexError('User not found');

    const currentFriendRequest = await ctx.db.get(args.id);

    if (
      !currentFriendRequest ||
      currentFriendRequest.receiver !== currentUser._id
    )
      throw new ConvexError('Invalid friend request');

    await ctx.db.delete(args.id);
  },
});

export const accept = mutation({
  args: {
    id: v.id('friend_requests'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) throw new ConvexError('Not authenticated');

    const currentUser = await getUserDataById({
      ctx,
      clerkId: identity.subject,
    });

    if (!currentUser) throw new ConvexError('User not found');

    const currentFriendRequest = await ctx.db.get(args.id);

    if (
      !currentFriendRequest ||
      currentFriendRequest.receiver !== currentUser._id
    )
      throw new ConvexError('Invalid friend request');

    const conversationId = await ctx.db.insert('conversations', {
      isGroup: false,
    });

    await ctx.db.insert('contacts', {
      user1: currentUser._id,
      user2: currentFriendRequest.sender,
      conversationId,
    });

    await ctx.db.insert('conversation_members', {
      memberId: currentUser._id,
      conversationId,
    });

    await ctx.db.insert('conversation_members', {
      memberId: currentFriendRequest.sender,
      conversationId,
    });

    await ctx.db.delete(currentFriendRequest._id);
  },
});
