import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadFile } from '../services/datasets'
import { useSessionId } from './useSessionId'
import { useDatasetStore } from '../stores/datasetStore'

export function useUpload() {
  const sessionId = useSessionId()
  const queryClient = useQueryClient()
  const setActiveDataset = useDatasetStore((s) => s.setActiveDataset)

  return useMutation({
    mutationFn: (file: File) => uploadFile(file, sessionId),
    onSuccess: (dataset) => {
      setActiveDataset(dataset)
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
    },
  })
}
