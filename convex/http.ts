import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { Webhook } from 'svix';
import { internal } from './_generated/api';

const validatePayload = async (req: Request): Promise<any> => {
  const svixHeaders = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-signature': req.headers.get('svix-signature')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
  };

  const payload = await req.text();

  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  try {
    return webhook.verify(payload, svixHeaders);
  } catch (error) {
    console.error('Error validating webhook payload', error);
    return;
  }
};

const handler = httpAction(async (ctx, req) => {
  const event = await validatePayload(req);

  if (!event) {
    return new Response('Invalid webhook payload', { status: 400 });
  }

  switch (event.type) {
    case 'user.created':
      const user = await ctx.runQuery(internal.user.get, {
        clerkId: event.data.id,
      });

      if (user) {
        console.log(`Updating user ${event.data.id} with new data`);
      }
    case 'user.updated':
      console.log(event.data);
      console.log(`Updating user ${event.data.id} with new data`);

      await ctx.runMutation(internal.user.create, {
        username: `${event.data.first_name} ${event.data.last_name}`,
        status: `Just came onboard! 🚀`,
        email: event.data.email_addresses[0].email_address,
        imageUrl: event.data.image_url,
        clerkId: event.data.id,
      });

      break;
    default:
      console.log('Unhandled webhook event', event.type);
  }

  return new Response('Webhook processed', { status: 200 });
});

const http = httpRouter();

http.route({
  path: '/clerk-auth-users-webhook',
  method: 'POST',
  handler,
});

export default http;
