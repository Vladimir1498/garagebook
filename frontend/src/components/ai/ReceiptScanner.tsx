import { useState, useRef } from 'react'
import { Camera, Loader2, Check, AlertCircle } from 'lucide-react'
import Button from '../ui/Button'
import { aiService } from '../../services/ai.service'
import { formatMoney } from '../../utils/formatCurrency'

interface ScanResult {
  amount: number | null
  date: string | null
  vendor: string | null
  category: string | null
  source: string
}

interface ReceiptScannerProps {
  onScan: (data: ScanResult) => void
}

export default function ReceiptScanner({ onScan }: ReceiptScannerProps) {
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
      const { data } = await aiService.scanReceipt(file)
      const parts = []
      if (data.vendor) parts.push(data.vendor)
      if (data.amount) parts.push(formatMoney(data.amount))
      if (data.date) parts.push(data.date)
      setResult(parts.length > 0 ? `Найдено: ${parts.join(' · ')}` : 'Чек распознан, но данные не извлечены')
      onScan(data)
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
        {scanning ? 'Распознаю...' : 'Сканировать чек'}
      </Button>
      {result && (
        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <Check className="h-3 w-3" /> {result}
        </span>
      )}
      {error && (
        <span className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" /> {error}
        </span>
      )}
    </div>
  )
}
