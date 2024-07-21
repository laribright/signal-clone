import { ConvexError, v } from 'convex/values';
import { mutation } from './_generated/server';
import { getUserDataById } from './_utils';

export const block = mutation({
  args: {
    conversationId: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) throw new ConvexError('Not authenticated');

    const currentUser = await getUserDataById({
      ctx,
      clerkId: identity.subject,
    });

    if (!currentUser) throw new ConvexError('User not found');

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) throw new ConvexError('Conversation not found');

    const memberships = await ctx.db
      .query('conversation_members')
      .withIndex('by_conversationId', q =>
        q.eq('conversationId', args.conversationId)
      )
      .collect();

    if (!memberships || memberships.length !== 2)
      throw new ConvexError('Cannot leave a conversation with only one member');

    const contact = await ctx.db
      .query('contacts')
      .withIndex('by_conversationId', q =>
        q.eq('conversationId', args.conversationId)
      )
      .unique();

    if (!contact) throw new ConvexError('Contact not found');

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversationId', q =>
        q.eq('conversationId', args.conversationId)
      )
      .collect();

    await ctx.db.delete(args.conversationId);

    await ctx.db.delete(contact._id);

    await Promise.all(memberships.map(m => ctx.db.delete(m._id)));

    await Promise.all(messages.map(m => ctx.db.delete(m._id)));
  },
});
