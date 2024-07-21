import { ConvexError, v } from 'convex/values';
import { mutation } from './_generated/server';

import { getUserDataById } from './_utils';

export const create = mutation({
  args: {
    conversationId: v.id('conversations'),
    type: v.string(),
    content: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) throw new ConvexError('Not authenticated');

    const currentUser = await getUserDataById({
      ctx,
      clerkId: identity.subject,
    });

    if (!currentUser) throw new ConvexError('User not found');

    const membership = await ctx.db
      .query('conversation_members')
      .withIndex('by_memberId_conversationId', q =>
        q
          .eq('memberId', currentUser._id)
          .eq('conversationId', args.conversationId)
      )
      .unique();

    if (!membership) throw new ConvexError('Not a member of this conversation');

    const message = await ctx.db.insert('messages', {
      senderId: currentUser._id,
      ...args,
    });

    await ctx.db.patch(args.conversationId, {
      lastMessage: message,
    });

    return message;
  },
});
