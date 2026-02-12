import { useQuery } from '@tanstack/react-query'
import { fetchQueryHistory } from '../services/queries'
import { useSessionId } from './useSessionId'

export function useQueryHistory(datasetId: string | undefined) {
  const sessionId = useSessionId()

  return useQuery({
    queryKey: ['queryHistory', datasetId],
    queryFn: () => fetchQueryHistory(datasetId!, sessionId),
    enabled: !!datasetId,
  })
}
