import { useState, useCallback } from 'react'
import { Upload, FileUp, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useUpload } from '@/hooks/useUpload'

const ALLOWED_EXTENSIONS = ['.csv', '.json', '.sql', '.xlsx']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function FileUpload() {
  const [dragOver, setDragOver] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const upload = useUpload()

  const validateFile = useCallback((file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file type. Please use ${ALLOWED_EXTENSIONS.join(', ')}`
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File is too large. Maximum size is 10MB.'
    }
    return null
  }, [])

  const handleFile = useCallback(
    (file: File) => {
      const error = validateFile(file)
      if (error) {
        setValidationError(error)
        return
      }
      setValidationError(null)
      upload.mutate(file)
    },
    [validateFile, upload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <label
            className={`flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              {upload.isPending ? (
                <>
                  <FileUp className="h-10 w-10 text-primary animate-pulse" />
                  <p className="text-sm font-medium">Uploading...</p>
                  <Progress value={undefined} className="w-48" />
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Drop your file here, or click to browse
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      CSV, JSON, SQL, or Excel files up to 10MB
                    </p>
                  </div>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv,.json,.sql,.xlsx"
              onChange={handleChange}
              disabled={upload.isPending}
            />
          </label>

          {validationError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {upload.isError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {upload.error instanceof Error
                  ? upload.error.message
                  : 'Upload failed. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {upload.isSuccess && (
            <Alert className="mt-4">
              <AlertDescription>
                Dataset uploaded successfully! You can now query it.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
