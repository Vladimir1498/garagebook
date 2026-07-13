import { useState, useRef } from 'react'
import { Camera, Loader2, Check, AlertCircle } from 'lucide-react'
import Button from '../ui/Button'
import { aiService } from '../../services/ai.service'

interface VinScannerProps {
  onScan: (vin: string) => void
}

export default function VinScanner({ onScan }: VinScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    setResult(null)
    setError(null)
    try {
      const { data } = await aiService.scanVin(file)
      if (data.vin) {
        setResult(`VIN: ${data.vin}`)
        onScan(data.vin)
      } else {
        setError('VIN не распознан')
      }
    } catch {
      setError('Ошибка распознавания')
    } finally {
      setScanning(false)
    }
    e.target.value = ''
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={scanning}>
        {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        {scanning ? 'Распознаю...' : 'Сканировать VIN'}
      </Button>
      {result && (
        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <Check className="h-3 w-3" /> {result}
        </span>
      )}
      {error && (
        <span className="flex items-center gap-1 text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  )
}
