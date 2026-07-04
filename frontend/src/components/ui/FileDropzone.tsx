import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { clsx } from 'clsx'

interface FileDropzoneProps {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
}

export default function FileDropzone({ onFiles, accept, multiple = false, maxFiles = 5 }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).slice(0, maxFiles)
    if (files.length) onFiles(files)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, maxFiles)
    if (files.length) onFiles(files)
    e.target.value = ''
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={clsx(
        'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-200',
        isDragging
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-surface-300 hover:border-primary-400 hover:bg-surface-50 dark:border-surface-600 dark:hover:bg-surface-700'
      )}
    >
      <Upload className={clsx('mb-3 h-8 w-8', isDragging ? 'text-primary-500' : 'text-surface-400')} />
      <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Перетащите файлы сюда</p>
      <p className="mt-1 text-xs text-surface-400">или нажмите для выбора</p>
      <input ref={inputRef} type="file" className="hidden" accept={accept} multiple={multiple} onChange={handleChange} />
    </div>
  )
}
