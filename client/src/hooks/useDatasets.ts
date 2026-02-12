import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchDatasets, deleteDataset } from '../services/datasets'
import { useSessionId } from './useSessionId'

export function useDatasets() {
  const sessionId = useSessionId()

  return useQuery({
    queryKey: ['datasets', sessionId],
    queryFn: () => fetchDatasets(sessionId),
  })
}

export function useDeleteDataset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDataset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
    },
  })
}
