import { FC, ReactNode } from 'react';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

type MessageItemProps = {
  fromCurrentUser: boolean;
  senderImage: string;
  senderName: string;
  lastByUser: boolean;
  content: string[];
  createdAt: number;
  type: string;
  seen?: ReactNode;
};

export const MessageItem: FC<MessageItemProps> = ({
  content,
  createdAt,
  fromCurrentUser,
  lastByUser,
  senderImage,
  senderName,
  type,
  seen,
}) => {
  const formatTime = (timestamp: number) => format(timestamp, 'HH:mm');

  return (
    <div
      className={cn('flex items-end', {
        'justify-end': fromCurrentUser,
      })}
    >
      <div
        className={cn('flex flex-col w-full mx-2', {
          'order-1 items-end': fromCurrentUser,
          'order-2 items-start': !fromCurrentUser,
        })}
      >
        <div
          className={cn(
            'px-3 py-1 flex flex-col space-x-2 items-center justify-between rounded-lg max-w-[80%]',
            {
              'bg-blue-700 text-primary-foreground':
                fromCurrentUser && type === 'text',
              'bg-secondary text-secondary-foreground':
                !fromCurrentUser && type === 'text',
              'rounded-br-none': !lastByUser && fromCurrentUser,
              'rounded-bl-none': !lastByUser && !fromCurrentUser,
            }
          )}
        >
          {type == 'text' && (
            <p className='text-wrap break-words whitespace-pre-wrap break-all'>
              {content}
            </p>
          )}

          {type === 'audio' && (
            <audio className='max-w-44 md:max-w-full' controls>
              <source src={content[0]} type='audio/mpeg' />
              Your browser does not support the audio element.
            </audio>
          )}

          {type === 'image' && (
            <Link
              href={content[0]}
              passHref
              target='_blank'
              rel='noopener noreferrer'
            >
              <Image
                src={content[0]}
                alt='image'
                width={240}
                height={112}
                className='rounded-xl w-60 object-cover h-28'
              />
            </Link>
          )}

          {type === 'pdf' && (
            <Link href={content[0]} target='_blank' rel='noopener noreferrer'>
              <p className='underline'>PDF Document</p>
            </Link>
          )}

          <p
            className={cn('text-xs flex w-full my-1', {
              'text-primary-foreground justify-end': fromCurrentUser,
              'text-secondary-foreground justify-start': !fromCurrentUser,
              'dark:text-white text-black':
                type === 'audio' || type === 'image' || type === 'pdf',
            })}
          >
            {formatTime(createdAt)}
          </p>
        </div>
        <span className='text-sm italic'>{seen}</span>
      </div>

      <Avatar
        className={cn('w-8 h-8 relative', {
          'order-2': fromCurrentUser,
          'order-1': !fromCurrentUser,
          invisible: lastByUser,
        })}
      >
        <AvatarImage src={senderImage} alt={senderName} />
        <AvatarFallback>{senderName.slice(0, 2)}</AvatarFallback>
      </Avatar>
    </div>
  );
};
