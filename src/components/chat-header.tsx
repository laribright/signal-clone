'use client';

import { ChevronLeft, Phone, Video } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';
import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '../../convex/_generated/api';

import { useSidebarWidth } from '@/hooks/use-sidebar-width';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { Button } from '@/components/ui/button';
import { ProfileSheet } from '@/components/profile-sheet';
import { GroupSheet } from '@/components/group-sheet';

type ChatHeaderProps = {
  chatAvatar: string;
  username: string;
  isGroup: boolean;
  chatId: string;
  status: string;
};

export const ChatHeader: FC<ChatHeaderProps> = ({
  chatAvatar,
  chatId,
  isGroup,
  status,
  username,
}) => {
  const { sidebarWidth } = useSidebarWidth();
  const isDesktop = useIsDesktop();
  const router = useRouter();
  const conversations = useQuery(api.conversations.get);

  const groupsInCommon = conversations?.filter(
    ({ conversation }) => conversation.isGroup
  );

  const videoCall = () => router.push(`/calls/${chatId}`);

  return (
    <div
      className={cn(
        'fixed bg-white dark:bg-gray-800 px-3 md:pr-10 flex items-center justify-between space-x-3 z-30 top-0 w-full h-20'
      )}
      style={isDesktop ? { width: `calc(100% - ${sidebarWidth + 3}%)` } : {}}
    >
      <div className='flex space-x-3'>
        <div className='md:hidden'>
          <Button asChild variant='outline' size='icon'>
            <Link href='/chats'>
              <ChevronLeft />
            </Link>
          </Button>
        </div>
        <Sheet>
          <SheetTrigger className='flex items-center cursor-pointer space-x-4'>
            <Avatar>
              <AvatarImage src={chatAvatar} />
              <AvatarFallback>{username[0]}</AvatarFallback>
            </Avatar>
            <h2 className='font-bold text-lg'>{username}</h2>
          </SheetTrigger>
          <SheetContent className='bg-white dark:bg-black dark:text-white w-80 md:w-96'>
            {isGroup ? (
              <GroupSheet chatId={chatId} groupName={username} />
            ) : (
              <ProfileSheet
                username={username}
                status={status}
                chatId={chatId}
                groupsInCommon={groupsInCommon}
                chatAvatar={chatAvatar}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>

      <div className='flex items-center space-x-4'>
        <Video className='cursor-pointer' onClick={videoCall} />
        <Phone className='cursor-pointer' onClick={videoCall} />
      </div>
    </div>
  );
};
