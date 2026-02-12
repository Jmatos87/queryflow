import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportCSV, exportJSON } from './export'

describe('export utils', () => {
  let mockCreateObjectURL: ReturnType<typeof vi.fn>
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>
  let mockClick: ReturnType<typeof vi.fn>
  let capturedHref: string
  let capturedDownload: string

  beforeEach(() => {
    mockCreateObjectURL = vi.fn().mockReturnValue('blob:test')
    mockRevokeObjectURL = vi.fn()
    mockClick = vi.fn()

    URL.createObjectURL = mockCreateObjectURL
    URL.revokeObjectURL = mockRevokeObjectURL

    vi.spyOn(document, 'createElement').mockReturnValue({
      set href(v: string) { capturedHref = v },
      get href() { return capturedHref },
      set download(v: string) { capturedDownload = v },
      get download() { return capturedDownload },
      click: mockClick,
    } as unknown as HTMLElement)
    vi.spyOn(document.body, 'appendChild').mockImplementation((n) => n)
    vi.spyOn(document.body, 'removeChild').mockImplementation((n) => n)
  })

  describe('exportCSV', () => {
    it('should do nothing for empty data', () => {
      exportCSV([], 'test')
      expect(mockCreateObjectURL).not.toHaveBeenCalled()
    })

    it('should create and trigger a download', () => {
      const data = [{ name: 'Alice', age: 30 }]
      exportCSV(data, 'test')

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(capturedDownload).toBe('test.csv')
      expect(mockRevokeObjectURL).toHaveBeenCalled()
    })

    it('should pass CSV content with headers', () => {
      const data = [{ name: 'Alice', age: 30 }]
      exportCSV(data, 'test')

      const blob = mockCreateObjectURL.mock.calls[0][0] as Blob
      expect(blob.type).toBe('text/csv')
    })
  })

  describe('exportJSON', () => {
    it('should create and trigger a download', () => {
      const data = [{ name: 'Alice' }]
      exportJSON(data, 'test')

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(capturedDownload).toBe('test.json')
    })

    it('should pass JSON content', () => {
      const data = [{ name: 'Alice' }]
      exportJSON(data, 'test')

      const blob = mockCreateObjectURL.mock.calls[0][0] as Blob
      expect(blob.type).toBe('application/json')
    })
  })
})
