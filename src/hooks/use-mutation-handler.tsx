import { useMutation } from 'convex/react';
import { useCallback, useState } from 'react';

type MutationState = 'idle' | 'loading' | 'success' | 'error';

export const useMutationHandler = <T, P>(mutation: any) => {
  const [state, setState] = useState<MutationState>('idle');
  const mutationFn = useMutation(mutation);

  const mutate = useCallback(
    async (payload: P): Promise<T | null> => {
      setState('loading');

      try {
        const result = await mutationFn(payload);
        setState('success');
        return result;
      } catch (error) {
        setState('error');
        console.log('Mutation error', error);
        throw error;
      } finally {
        setState('idle');
      }
    },
    [mutationFn]
  );

  return { state, mutate };
};
