import { zodResolver } from '@hookform/resolvers/zod';
import { ConvexError } from 'convex/values';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { api } from '../../convex/_generated/api';
import Picker from '@emoji-mart/react';
import { Paperclip, Send, Smile } from 'lucide-react';
import { useTheme } from 'next-themes';
import data from '@emoji-mart/data';
import TextareaAutoSize from 'react-textarea-autosize';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { v4 as uuid } from 'uuid';
import { AudioRecorder } from 'react-audio-voice-recorder';
import Pusher from 'pusher-js';
import axios from 'axios';

import { useMutationHandler } from '@/hooks/use-mutation-handler';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { Form, FormControl, FormField } from '@/components/ui/form';
import { useSidebarWidth } from '@/hooks/use-sidebar-width';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabaseBrowserClient as supabase } from '@/supabase/supabaseClient';

type ChatFooterProps = {
  chatId: string;
  currentUserId: string;
};

const ChatMessageSchema = z.object({
  content: z.string().min(1, {
    message: 'Message must not be empty',
  }),
});

export const ChatFooter: FC<ChatFooterProps> = ({ chatId, currentUserId }) => {
  const { mutate: createMessage, state: createMessageState } =
    useMutationHandler(api.message.create);
  const isDesktop = useIsDesktop();
  const { sidebarWidth } = useSidebarWidth();
  const { resolvedTheme } = useTheme();
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [imageOrPdf, setImageOrPdf] = useState<Blob | null>(null);
  const [imageOrPdfModalOpen, setImageOrPdfModalOpen] = useState(false);
  const [sendingFile, setSendingFile] = useState(false);

  registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

  const form = useForm<z.infer<typeof ChatMessageSchema>>({
    resolver: zodResolver(ChatMessageSchema),
    defaultValues: { content: '' },
  });

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(chatId);

    channel.bind('typing', (data: { isTyping: boolean; userId: string }) => {
      if (data.userId !== currentUserId) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      pusher.unsubscribe(chatId);
    };
  }, [chatId, currentUserId]);

  const createMessagehandler = async ({
    content,
  }: z.infer<typeof ChatMessageSchema>) => {
    if (!content || content.length < 1) return;
    try {
      await createMessage({
        conversationId: chatId,
        type: 'text',
        content: [content],
      });
    } catch (error) {
      console.log(error);
      toast.error(
        error instanceof ConvexError ? error.data : 'An error occurred'
      );
    }
  };

  const handleInputChange = async (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value, selectionStart } = e.target;

    if (selectionStart !== null) form.setValue('content', value);

    if (!typing) {
      setTyping(true);
      await axios.post('/api/type-indicator', {
        channel: chatId,
        event: 'typing',
        data: { isTyping: true, userId: currentUserId },
      });

      setTimeout(() => {
        setTyping(false);
        axios.post('/api/type-indicator', {
          channel: chatId,
          event: 'typing',
          data: { isTyping: false, userId: currentUserId },
        });
      }, 2000);
    }
  };

  const handleImageUpload = async () => {
    const uniqueId = uuid();
    if (!imageOrPdf) return;
    setSendingFile(true);

    try {
      let fileName;
      if (imageOrPdf.type.startsWith('image/')) {
        fileName = `chat/image-${uniqueId}.jpg`;
      } else if (imageOrPdf.type.startsWith('application/pdf')) {
        fileName = `chat/pdf-${uniqueId}.pdf`;
      } else {
        console.error('Invalid file type');
        setSendingFile(false);
        return;
      }

      const file = new File([imageOrPdf], fileName, { type: imageOrPdf.type });

      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.log('Error uploading file: ', error);
        setSendingFile(false);
        return;
      }

      const {
        data: { publicUrl },
      } = await supabase.storage.from('chat-files').getPublicUrl(data.path);

      await createMessage({
        conversationId: chatId,
        type: imageOrPdf.type.startsWith('image/') ? 'image' : 'pdf',
        content: [publicUrl],
      });

      setSendingFile(false);
      setImageOrPdfModalOpen(false);
    } catch (error) {
      setSendingFile(false);
      setImageOrPdfModalOpen(false);
      console.log(error);
      toast.error('Failed to send file, please try again');
    }
  };

  const addAudioElement = async (blob: Blob) => {
    try {
      const uniqueId = uuid();

      const file = new File([blob], 'adio.webm', { type: blob.type });
      const fileName = `chat/audio-${uniqueId}`;

      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.log('Error uploading audio: ', error);
        toast.error('Failed to upload audio, please try again');
        return;
      }

      const {
        data: { publicUrl },
      } = await supabase.storage.from('chat-files').getPublicUrl(data.path);

      await createMessage({
        conversationId: chatId,
        type: 'audio',
        content: [publicUrl],
      });
    } catch (error) {
      console.error('Failed to upload audio', error);
      toast.error('Failed to upload audio, please try again');
    }
  };

  return (
    <Form {...form}>
      <form
        style={isDesktop ? { width: `calc(100% - ${sidebarWidth + 3}%)` } : {}}
        className='fixed px-3 md:pr-10 flex items-center justify-between space-x-3 z-30 bottom-0 w-full bg-white dark:bg-gray-800 h-20'
        onSubmit={form.handleSubmit(createMessagehandler)}
      >
        <Popover>
          <PopoverTrigger>
            <button type='button'>
              <Smile size={20} />
            </button>
          </PopoverTrigger>
          <PopoverContent className='w-fit p-0'>
            <Picker
              theme={resolvedTheme}
              data={data}
              onEmojiSelect={(emoji: any) =>
                form.setValue(
                  'content',
                  `${form.getValues('content')}${emoji.native}`
                )
              }
            />
          </PopoverContent>
        </Popover>

        <FormField
          control={form.control}
          name='content'
          render={({ field }) => (
            <FormControl>
              <>
                <TextareaAutoSize
                  onKeyDown={async e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      await form.handleSubmit(createMessagehandler)();
                    }
                  }}
                  rows={1}
                  maxRows={2}
                  {...field}
                  disabled={createMessageState === 'loading'}
                  placeholder='Type a message'
                  onChange={handleInputChange}
                  className='flex-grow bg-gray-200 dark:bg-gray-600 rounded-2xl resize-none px-4 p-2 ring-0 focus:ring-0 focus:outline-none outline-none'
                />
                {isTyping && <p className='text-xs ml-1'>typing...</p>}
              </>
            </FormControl>
          )}
        />

        <Send
          className='cursor-pointer'
          onClick={async () => form.handleSubmit(createMessagehandler)()}
        />

        <Dialog
          open={imageOrPdfModalOpen}
          onOpenChange={() => setImageOrPdfModalOpen(!imageOrPdfModalOpen)}
        >
          <DialogTrigger>
            <Paperclip className='cursor-pointer' />
          </DialogTrigger>

          <DialogContent className='min-w-80'>
            <DialogHeader>
              <DialogTitle>Upload PDF / IMG</DialogTitle>
              <DialogDescription>📁 Upload</DialogDescription>
            </DialogHeader>

            <FilePond
              className='cursor-pointer'
              files={imageOrPdf ? [imageOrPdf] : []}
              allowMultiple={false}
              acceptedFileTypes={['image/*', 'application/pdf']}
              labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
              onupdatefiles={fileItems => {
                setImageOrPdf(fileItems[0]?.file ?? null);
              }}
            />

            <DialogFooter>
              <Button
                onClick={handleImageUpload}
                type='button'
                disabled={sendingFile}
              >
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isDesktop && (
          <AudioRecorder
            onRecordingComplete={addAudioElement}
            audioTrackConstraints={{
              noiseSuppression: true,
              echoCancellation: true,
            }}
            downloadFileExtension='webm'
          />
        )}
      </form>
    </Form>
  );
};
