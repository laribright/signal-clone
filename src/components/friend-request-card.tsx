import { Id } from '../../convex/_generated/dataModel';
import { FC } from 'react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';
import { ConvexError } from 'convex/values';
import { Handshake, X } from 'lucide-react';

import { useMutationHandler } from '@/hooks/use-mutation-handler';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

type FriendRequestCardProps = {
  id: Id<'friend_requests'>;
  imageUrl: string;
  username: string;
  email: string;
};

export const FriendRequestCard: FC<FriendRequestCardProps> = ({
  email,
  id,
  imageUrl,
  username,
}) => {
  const { mutate: acceptRequest, state: acceptRequestState } =
    useMutationHandler(api.friend_request.accept);
  const { mutate: declineRequest, state: declineRequestState } =
    useMutationHandler(api.friend_request.decline);

  const handleDenyRequest = async (id: string) => {
    try {
      await declineRequest({ id });
      toast.success('Friend request declined');
    } catch (error) {
      console.log('Error declining friend request:', error);
      toast.error(
        error instanceof ConvexError ? error.data : 'An error occurred'
      );
    }
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      await acceptRequest({ id });
      toast.success('Friend request accepted');
    } catch (error) {
      console.log('Error accepting friend request:', error);
      toast.error(
        error instanceof ConvexError ? error.data : 'An error occurred'
      );
    }
  };

  return (
    <div className='flex items-center justify-between space-x-4 rounded-md border p-4'>
      <div className='flex items-center space-x-3'>
        <Handshake />
        <Avatar>
          <AvatarImage src={imageUrl} />
          <AvatarFallback>{username.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className='flex justify-between items-center'>
          <div className='flex-1 space-y-1'>
            <p className='text-sm font-medium leading-none'>{username}</p>
            <p className='text-sm text-muted-foreground'>{email}</p>
          </div>
        </div>
      </div>
      <div className='flex items-center gap-x-5'>
        <Switch
          disabled={
            acceptRequestState === 'loading' ||
            declineRequestState === 'loading'
          }
          onCheckedChange={_ => handleAcceptRequest(id)}
        />
        <Button
          size='icon'
          variant='destructive'
          disabled={
            acceptRequestState === 'loading' ||
            declineRequestState === 'loading'
          }
          onClick={_ => handleDenyRequest(id)}
        >
          <X />
        </Button>
      </div>
    </div>
  );
};
