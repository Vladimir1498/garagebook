import { useRef } from 'react'
import { Camera } from 'lucide-react'

interface CarPhotoGalleryProps {
  photoUrl: string | null
  onUpload: (file: File) => void
}

export default function CarPhotoGallery({ photoUrl, onUpload }: CarPhotoGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    e.target.value = ''
  }

  // If photo exists, show a compact upload button (hero already displays the image)
  if (photoUrl) {
    return (
      <button
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-600 transition-colors hover:bg-surface-50 dark:border-surface-600 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
      >
        <Camera className="h-3.5 w-3.5" />
        Заменить фото
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </button>
    )
  }

  return (
    <button
      onClick={() => inputRef.current?.click()}
      className="flex h-64 w-full items-center justify-center rounded-2xl border-2 border-dashed border-surface-300 bg-surface-50 transition-colors hover:border-primary-400 hover:bg-primary-50 dark:border-surface-600 dark:bg-surface-800 dark:hover:border-primary-500"
    >
      <div className="text-center">
        <Camera className="mx-auto h-8 w-8 text-surface-400" />
        <p className="mt-2 text-sm text-surface-500">Добавить фото</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </button>
  )
}
