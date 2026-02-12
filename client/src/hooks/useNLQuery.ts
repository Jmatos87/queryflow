import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitQuery } from '../services/queries'
import { useSessionId } from './useSessionId'
import { useQueryStore } from '../stores/queryStore'
import { useDatasetStore } from '../stores/datasetStore'

export function useNLQuery() {
  const sessionId = useSessionId()
  const queryClient = useQueryClient()
  const activeDataset = useDatasetStore((s) => s.activeDataset)
  const setLastQuery = useQueryStore((s) => s.setLastQuery)
  const setIsQuerying = useQueryStore((s) => s.setIsQuerying)

  return useMutation({
    mutationFn: (question: string) => {
      if (!activeDataset) throw new Error('No dataset selected')
      setIsQuerying(true)
      return submitQuery(activeDataset.id, question, sessionId)
    },
    onSuccess: (data) => {
      setLastQuery(data)
      setIsQuerying(false)
      if (activeDataset) {
        queryClient.invalidateQueries({
          queryKey: ['queryHistory', activeDataset.id],
        })
      }
    },
    onError: () => {
      setIsQuerying(false)
    },
  })
}
