import { FC } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Link from 'next/link';
import Image from 'next/image';

export const ChatTypeContent: FC<{
  type: string;
  content: string[];
}> = ({ content, type }) => {
  return (
    <AspectRatio ratio={1 / 1}>
      {type === 'image' && (
        <Image
          src={content[0]}
          alt='file'
          width={450}
          height={235}
          className='rounded-md object-cover'
        />
      )}

      {type === 'audio' && (
        <audio src={content[0]} controls className='w-full h-full' />
      )}
      {type === 'pdf' && (
        <Link
          href={content[0]}
          target='_blank'
          rel='noopener noreferrer'
          className='bg-purple-500'
        >
          <p className='underline'>PDF Document</p>
        </Link>
      )}
    </AspectRatio>
  );
};
