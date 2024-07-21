import { Ban, Phone, Scroll, Video } from 'lucide-react';
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

type ProfileSheetProps = {
  chatId: string;
  username: string;
  status: string;
  groupsInCommon:
    | {
        conversation: {
          isGroup: boolean;
          name?: string;
          _creationTime: number;
          _id: string;
        };
        unseenCount: number;
      }[]
    | undefined;
  chatAvatar: string;
};

export const ProfileSheet: FC<ProfileSheetProps> = ({
  chatAvatar,
  chatId,
  groupsInCommon,
  status,
  username,
}) => {
  const [blockConfirmationDialog, setBlockConfirmationDialog] = useState(false);

  const messages = useQuery(api.messages.get, {
    id: chatId as Id<'conversations'>,
  });

  const { mutate: blockContact, state: blockContactState } = useMutationHandler(
    api.contact.block
  );

  const blockContactHandler = async () => {
    try {
      await blockContact({ conversationId: chatId });

      toast.success('Contact blocked');
    } catch (error) {
      console.log(error);
      toast.error(
        error instanceof ConvexError ? error.data : 'An error occurred'
      );
    }
  };

  const chatFiles = messages?.filter(({ type }) => type !== 'text');

  return (
    <ScrollArea className='h-full'>
      <Avatar className='mx-auto h-20 w-20 mt-10'>
        <AvatarImage src={chatAvatar} />
        <AvatarFallback>{username[0]}</AvatarFallback>
      </Avatar>
      <SheetTitle className='text-center mt-2 text-2xl'>{username}</SheetTitle>
      <p className='text-center'>{status}</p>

      <div className='flex justify-center space-x-4 mt-5'>
        <ActionButton Icon={Video} label='Video' />
        <ActionButton Icon={Phone} label='Call' />
      </div>

      <Separator className='my-5 border border-gray-100 dark:border-gray-800' />

      <Dialog
        open={blockConfirmationDialog}
        onOpenChange={() =>
          setBlockConfirmationDialog(!blockConfirmationDialog)
        }
      >
        <DialogTrigger
          className='w-full'
          onClick={() => setBlockConfirmationDialog(true)}
        >
          <div className='flex items-center justify-center w-full text-red-600 space-x-3'>
            <Ban />
            <p>Block</p>
          </div>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle className='mb-5'>
              Are you absolutely sure you want to block {username}?
            </DialogTitle>
          </DialogHeader>
          <div className='flex items-center space-x-3'>
            <Button
              onClick={() => setBlockConfirmationDialog(false)}
              variant='link'
              disabled={blockContactState === 'loading'}
            >
              Cancel
            </Button>
            <Button
              disabled={blockContactState === 'loading'}
              variant='destructive'
              onClick={blockContactHandler}
            >
              Block
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Separator className='my-5 border border-gray-100 dark:border-gray-800' />

      <div>
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

      <div className='flex flex-col gap-y-2'>
        <p className='font-bold text-lg'>
          {groupsInCommon?.length || 0}{' '}
          {pluralize('group', groupsInCommon?.length || 0)} in common
        </p>

        <div>
          {groupsInCommon?.length &&
            groupsInCommon.map(({ conversation }) => (
              <Link
                href={`/chats/${conversation._id}`}
                key={conversation._id}
                className='flex items-center space-x-3 hover:bg-gray-400 px-3 py-2 rounded-md'
              >
                <Avatar>
                  <AvatarFallback>
                    {conversation?.name?.slice(0, 2) || 'G'}
                  </AvatarFallback>
                </Avatar>
                <p>{conversation.name}</p>
              </Link>
            ))}
        </div>
      </div>
    </ScrollArea>
  );
};
