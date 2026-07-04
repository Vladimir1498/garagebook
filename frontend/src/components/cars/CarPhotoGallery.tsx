import { useState, useRef } from 'react'
import { Camera, X } from 'lucide-react'

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

  if (photoUrl) {
    return (
      <div className="relative overflow-hidden rounded-2xl">
        <img src={photoUrl} alt="Фото автомобиля" className="h-64 w-full object-cover sm:h-80" />
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-3 right-3 rounded-xl bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <Camera className="h-5 w-5" />
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </div>
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
