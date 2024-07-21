import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';

import { getUserDataById } from './_utils';

export const get = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) throw new ConvexError('Not authenticated');

    const currentUser = await getUserDataById({
      ctx,
      clerkId: identity.subject,
    });

    if (!currentUser) throw new ConvexError('User not found');

    const contacts1 = await ctx.db
      .query('contacts')
      .withIndex('by_user1', q => q.eq('user1', currentUser._id))
      .collect();

    const contacts2 = await ctx.db
      .query('contacts')
      .withIndex('by_user2', q => q.eq('user2', currentUser._id))
      .collect();

    const relatedContacts = contacts1.concat(contacts2);

    const contacts = await Promise.all(
      relatedContacts.map(async relatedContact => {
        const contact = await ctx.db.get(
          relatedContact.user1 === currentUser._id
            ? relatedContact.user2
            : relatedContact.user1
        );

        if (!contact) throw new ConvexError('Contact not found');

        return contact;
      })
    );

    return contacts;
  },
});

export const createGroup = mutation({
  args: {
    name: v.string(),
    members: v.array(v.id('users')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) throw new ConvexError('Not authenticated');

    const currentUser = await getUserDataById({
      ctx,
      clerkId: identity.subject,
    });

    if (!currentUser) throw new ConvexError('User not found');

    const conversationId = await ctx.db.insert('conversations', {
      name: args.name,
      isGroup: true,
    });

    await Promise.all(
      [...args.members, currentUser._id].map(async memberId =>
        ctx.db.insert('conversation_members', {
          conversationId,
          memberId,
        })
      )
    );
  },
});
