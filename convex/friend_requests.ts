import { ConvexError } from 'convex/values';
import { getUserDataById } from './_utils';
import { query } from './_generated/server';

export const get = query({
  args: {},
  handler: async (ctx, args) => {
    const indentity = await ctx.auth.getUserIdentity();

    if (!indentity) throw new ConvexError('Not authenticated');

    const currentUser = await getUserDataById({
      ctx,
      clerkId: indentity.subject,
    });

    if (!currentUser) throw new ConvexError('User not found');

    const friendRequests = await ctx.db
      .query('friend_requests')
      .withIndex('by_receiver', q => q.eq('receiver', currentUser._id))
      .collect();

    const requestsWithSender = await Promise.all(
      friendRequests.map(async friendRequest => {
        const sender = await ctx.db.get(friendRequest.sender);
        if (!sender) throw new ConvexError('Sender not found');

        return { ...friendRequest, sender };
      })
    );

    return requestsWithSender;
  },
});
