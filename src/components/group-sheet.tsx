import { Ban, LogOut, Phone, Scroll, Trash2, Video } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { FC, useState } from 'react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';
import { ConvexError } from 'convex/values';
import { Id } from '../../convex/_generated/dataModel';

import { SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMutationHandler } from '@/hooks/use-mutation-handler';
import { ChatTypeContent } from '@/components/chat-type-content';
import { pluralize } from '@/lib/utils';

type ActionButtonProps = {
  Icon: FC;
  label: string;
};

const ActionButton: FC<ActionButtonProps> = ({ Icon, label }) => (
  <div className='flex space-y-2 flex-col items-center w-fit px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800'>
    <Icon />
    <p className='text-xs'>{label}</p>
  </div>
);

type GroupSheetProps = {
  chatId: string;
  groupName: string;
};

export const GroupSheet: FC<GroupSheetProps> = ({ groupName, chatId }) => {
  const [deleteConfirmationDialog, setDeleteConfirmationDialog] =
    useState(false);
  const [leaveConfirmationDialog, setLeaveConfirmationDialog] = useState(false);

  const { mutate: leaveGroup, state: leaveGroupState } = useMutationHandler(
    api.conversation.leaveGroup
  );
  const { mutate: blockGroup, state: blockGroupState } = useMutationHandler(
    api.conversation.deleteGroup
  );

  const groupMembers = useQuery(api.conversation.getConversationMembers, {
    conversationId: chatId as Id<'conversations'>,
  });

  const messages = useQuery(api.messages.get, {
    id: chatId as Id<'conversations'>,
  });

  const chatFiles = messages?.filter(({ type }) => type !== 'text');

  const deleteGroupHandler = async () => {
    try {
      await blockGroup({ conversationId: chatId });

      toast.success('Group Deleted');
      setDeleteConfirmationDialog(false);
    } catch (error) {
      console.log(error);
      toast.error(
        error instanceof ConvexError ? error.data : 'An error occurred'
      );
    }
  };

  const leaveGroupHandler = async () => {
    try {
      await leaveGroup({ conversationId: chatId });

      toast.success('Left Group');
      setLeaveConfirmationDialog(false);
    } catch (error) {
      console.log(error);
      toast.error(
        error instanceof ConvexError ? error.data : 'An error occurred'
      );
    }
  };

  return (
    <ScrollArea className='h-full'>
      <Avatar className='mx-auto h-20 w-20 mt-10'>
        <AvatarFallback>{groupName.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <SheetTitle className='text-center mt-2 text-2xl'>{groupName}</SheetTitle>
      <div className='flex justify-center space-x-4 mt-5'>
        <ActionButton Icon={Video} label='Video' />
        <ActionButton Icon={Phone} label='Call' />
      </div>
      <Separator className='my-5 border border-gray-100 dark:border-gray-800' />
      <p className='font-bold text-lg'>
        {groupMembers?.members.length} members
      </p>

      <div>
        {groupMembers?.members &&
          groupMembers.members.map(member => (
            <div
              className='flex items-center justify-between space-x-3 my-3'
              key={member._id}
            >
              <div className='flex items-center space-x-3'>
                <Avatar>
                  <AvatarImage src={member.imageUrl} />
                  <AvatarFallback>{member.username[0]}</AvatarFallback>
                </Avatar>
                <p>{member.username}</p>
              </div>
            </div>
          ))}
      </div>

      <Separator className='my-5 border border-gray-100 dark:border-gray-800' />

      <div className='my-5'>
        <p className='font-bold text-lg my-5'>Shared Media</p>
        {chatFiles?.length ? (
          <ScrollArea className='rounded-md border max-w-80'>
            <div className='flex space-x-4 p-4'>
              {chatFiles.map(({ _id, type, content }) => (
                <div key={_id} className='w-[200px] rounded-xl overflow-hidden'>
                  <ChatTypeContent type={type} content={content} />
                </div>
              ))}
            </div>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        ) : (
          <p>No media shared</p>
        )}
      </div>

      <Separator className='my-5 border border-gray-100 dark:border-gray-800' />

      <Dialog
        open={deleteConfirmationDialog}
        onOpenChange={() =>
          setDeleteConfirmationDialog(!deleteConfirmationDialog)
        }
      >
        <DialogTrigger
          onClick={() => setDeleteConfirmationDialog(true)}
          className='w-full'
        >
          <div className='flex items-center justify-center w-full text-red-600 space-x-3'>
            <Trash2 />
            <p>Delete Group</p>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='mb-5'>
              Are you absolutely sure you want to delete {groupName} group?
            </DialogTitle>
          </DialogHeader>

          <div className='flex items-center space-x-3'>
            <Button
              variant='link'
              disabled={blockGroupState === 'loading'}
              onClick={() => setDeleteConfirmationDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              disabled={blockGroupState === 'loading'}
              onClick={deleteGroupHandler}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Separator className='my-5 border border-gray-100 dark:border-gray-800' />

      <Dialog
        open={leaveConfirmationDialog}
        onOpenChange={() =>
          setLeaveConfirmationDialog(!leaveConfirmationDialog)
        }
      >
        <DialogTrigger
          onClick={() => setLeaveConfirmationDialog(true)}
          className='w-full'
        >
          <div className='flex items-center justify-center w-full text-red-600 space-x-3'>
            <LogOut />
            <p>Leave Group</p>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='mb-5'>
              Are you absolutely sure you want to leave {groupName} group?
            </DialogTitle>
          </DialogHeader>

          <div className='flex items-center space-x-3'>
            <Button
              variant='link'
              disabled={leaveGroupState === 'loading'}
              onClick={() => setLeaveConfirmationDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              disabled={leaveGroupState === 'loading'}
              onClick={leaveGroupHandler}
            >
              Leave
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Separator className='my-5 border border-gray-100 dark:border-gray-800' />
    </ScrollArea>
  );
};
