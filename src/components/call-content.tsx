import Image from 'next/image';
import { RefreshCw } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const CallContent = () => {
  const [meetingCode, setMeetingCode] = useState('');
  const router = useRouter();

  const generateLink = () => {
    const code = uuid();

    navigator.clipboard.writeText(code);
    toast.success('Meeting code copied to clipboard');
  };

  const startMeeting = () => router.push(`/calls/${meetingCode}`);

  return (
    <div className='grid p-3 md:p-10 md:grid-cols-2 gap-10 w-full place-content-center'>
      <div className='flex items-center'>
        <div className='md:w-96 mx-auto flex flex-col gap-y-10'>
          <div className='flex flex-col gap-y-7'>
            <h1 className='text-4xl font-bold'>Start a meeting</h1>
            <div className='flex gap-2 flex-col md:flex-row'>
              <p className='mt-2 text-gray-500'>
                Share this code with others to join the meeting.
              </p>

              <Button onClick={generateLink}>
                Generate code
                <RefreshCw className='ml-2' />
              </Button>
            </div>
          </div>

          <div className='flex flex-col gap-y-5'>
            <Input
              className='h-14'
              type='text'
              placeholder='Input meeting link'
              onChange={e => setMeetingCode(e.target.value)}
            />
            <Button
              onClick={startMeeting}
              disabled={!meetingCode.length}
              className='w-full h-14'
            >
              Join meeting
            </Button>
          </div>
        </div>
      </div>
      <div className='w-72 h-72 lg:w-96 md:w-[300px] mx-auto lg:h-96 md:h-[300px] rounded-full overflow-hidden'>
        <Image
          src='https://images.unsplash.com/photo-1654277041050-d8f56bf61b62?q=80&w=1724&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          width={500}
          height={500}
          alt='meet'
          className='object-cover w-full h-full hover:scale-110 transition-transform'
        />
      </div>
    </div>
  );
};
