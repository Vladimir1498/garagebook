import { useState, useRef } from 'react'
import { Camera, Loader2, Check } from 'lucide-react'
import Button from '../ui/Button'
import { aiService } from '../../services/ai.service'
import { formatMoney } from '../../utils/formatCurrency'

interface ReceiptScannerProps {
  onScan: (data: { date: string | null; amount: number | null; vendor: string | null; items: Array<{ name: string; price: number }> }) => void
}

export default function ReceiptScanner({ onScan }: ReceiptScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    try {
      const { data } = await aiService.scanReceipt(file)
      setResult(`Найдено: ${data.vendor || '—'}, ${formatMoney(data.amount || 0)}`)
      onScan(data)
    } catch { setResult('Ошибка распознавания') }
    finally { setScanning(false) }
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-3">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={scanning}>
        {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        Сканировать чек
      </Button>
      {result && <span className="text-xs text-surface-500">{result}</span>}
    </div>
  )
}
