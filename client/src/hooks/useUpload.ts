import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadFile } from '../services/datasets'
import { useSessionId } from './useSessionId'

export function useUpload() {
  const sessionId = useSessionId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadFile(file, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
    },
  })
}
