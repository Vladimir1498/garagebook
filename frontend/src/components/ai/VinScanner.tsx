import { useState, useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import Button from '../ui/Button'
import { aiService } from '../../services/ai.service'

interface VinScannerProps {
  onScan: (data: { vin: string | null; brand: string | null; model: string | null; year: number | null }) => void
}

export default function VinScanner({ onScan }: VinScannerProps) {
  const [scanning, setScanning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    try {
      const { data } = await aiService.scanVin(file)
      onScan(data)
    } catch {}
    finally { setScanning(false) }
    e.target.value = ''
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={scanning}>
        {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        Сканировать VIN
      </Button>
    </div>
  )
}
