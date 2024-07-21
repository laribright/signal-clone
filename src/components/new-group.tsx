import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Users, X } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConvexError } from 'convex/values';

import { useMutationHandler } from '@/hooks/use-mutation-handler';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

const CreateGroupSchema = z.object({
  name: z.string().min(2, {
    message: 'Group name must be at least 2 characters long',
  }),
  members: z.array(z.string()).min(1, {
    message: 'Group must have at least 1 member',
  }),
});

export const NewGroup = () => {
  const contacts = useQuery(api.contacts.get);
  const [createGroupModal, setCreateGroupModal] = useState(false);

  const { mutate: createGroup, state: createGroupState } = useMutationHandler(
    api.contacts.createGroup
  );

  const form = useForm<z.infer<typeof CreateGroupSchema>>({
    resolver: zodResolver(CreateGroupSchema),
    defaultValues: {
      name: '',
      members: [],
    },
  });

  const members = form.watch('members', []);

  const unselectedContacts = useMemo(() => {
    return contacts
      ? contacts.filter(contact => !members.includes(contact._id))
      : [];
  }, [contacts, members]);

  const createGroupHandler = async ({
    members,
    name,
  }: z.infer<typeof CreateGroupSchema>) => {
    await createGroup({ name, members });

    setCreateGroupModal(false);
    form.reset();
    toast.success('Group created successfully');
    try {
    } catch (error) {
      console.log(error);
      toast.error(
        error instanceof ConvexError ? error.data : 'An error occured'
      );
    }
  };

  return (
    <div>
      <Dialog
        open={createGroupModal}
        onOpenChange={() => setCreateGroupModal(!createGroupModal)}
      >
        <DialogTrigger className='w-full'>
          <Users size={20} className='cursor-pointer' />
        </DialogTrigger>
        <DialogContent>
          <Form {...form}>
            <form
              className='space-y-8'
              onSubmit={form.handleSubmit(createGroupHandler)}
            >
              <fieldset>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder='onboarding' {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the name of the group
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='members'
                  render={_ => (
                    <FormItem>
                      <FormLabel>Contacts</FormLabel>
                      <FormControl>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            disabled={unselectedContacts.length === 0}
                          >
                            <Button className='ml-4' variant='outline'>
                              Select contacts
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent className='w-full'>
                            <DropdownMenuLabel>Contacts</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {unselectedContacts.map(contact => (
                              <DropdownMenuCheckboxItem
                                key={contact._id}
                                className='flex items-center gap-2 w-full p-2'
                                onCheckedChange={checked => {
                                  if (checked) {
                                    form.setValue('members', [
                                      ...members,
                                      contact._id,
                                    ]);
                                  }
                                }}
                              >
                                <Avatar className='h-8 w-8'>
                                  <AvatarImage src={contact.imageUrl} />
                                  <AvatarFallback>
                                    {contact.username.slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <h4 className='truncate'>{contact.username}</h4>
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </fieldset>

              {members.length ? (
                <Card className='flex items-center gap-3 overflow-x-auto w-full h-24 p-2'>
                  {contacts
                    ?.filter(contact => members.includes(contact._id))
                    .map(friend => (
                      <div
                        key={friend._id}
                        className='flex flex-col items-center gap-1'
                      >
                        <div className='relative'>
                          <Avatar className='h-8 w-8'>
                            <AvatarImage src={friend.imageUrl} />
                            <AvatarFallback>
                              {friend.username.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <X
                            onClick={() =>
                              form.setValue('members', [
                                ...members.filter(id => id !== friend._id),
                              ])
                            }
                            className='text-muted-foreground h-4 w-4 absolute bottom-8 left-7 bg-muted rounded-full cursor-pointer'
                          />
                        </div>
                      </div>
                    ))}
                </Card>
              ) : null}
              <DialogFooter>
                <Button type='submit' disabled={createGroupState === 'loading'}>
                  Create group
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
