import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Trash2, Eye, Upload, FileImage, File } from 'lucide-react'
import { useDocumentsList, useUploadDocument, useDeleteDocument } from '../../hooks/useDocuments'
import { useCars } from '../../hooks/useCars'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import Badge from '../../components/ui/Badge'
import DropdownSelect from '../../components/ui/DropdownSelect'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import { resolveFileUrl } from '../../utils/resolveFileUrl'
import { clsx } from 'clsx'

const categoryLabels: Record<string, string> = {
  insurance: 'Страховка', sts: 'СТС', diagnostics: 'Диагностика',
  work_order: 'Заказ-наряд', receipt: 'Чек', other: 'Прочее',
}

const categoryColors: Record<string, string> = {
  insurance: 'bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400',
  sts: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400',
  diagnostics: 'bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400',
  work_order: 'bg-purple-50 text-purple-500 dark:bg-purple-950/30 dark:text-purple-400',
  receipt: 'bg-cyan-50 text-cyan-500 dark:bg-cyan-950/30 dark:text-cyan-400',
  other: 'bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400',
}

export default function DocumentsPage() {
  const { t } = useTranslation()
  const { data: carsData } = useCars()
  const uploadDocument = useUploadDocument()
  const deleteDocument = useDeleteDocument()

  const cars = carsData?.data?.data || []
  const [selectedCar, setSelectedCar] = useState(cars[0]?.id || '')
  const [showTierModal, setShowTierModal] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [uploadCategory, setUploadCategory] = useState('other')

  // Fetch documents filtered by selected car
  const { data, isLoading } = useDocumentsList(selectedCar ? { car_id: selectedCar } : undefined)
  const documents = data?.data?.data || []

  const filteredDocuments = useMemo(() => {
    if (filterCategory === 'all') return documents
    return documents.filter((doc) => doc.category === filterCategory)
  }, [documents, filterCategory])

  const MAX_DOCS_FREE = 5

  const handleUpload = async (files: File[]) => {
    if (!selectedCar) { toast.error('Выберите автомобиль'); return }
    if (documents.length + files.length > MAX_DOCS_FREE) { setShowTierModal(true); return }
    for (const file of files) {
      try {
        await uploadDocument.mutateAsync({ carId: selectedCar, file, category: uploadCategory, name: file.name })
      } catch (err: any) {
        if (err.response?.status === 403) { setShowTierModal(true); return }
        toast.error(err.response?.data?.detail || 'Ошибка загрузки')
      }
    }
    toast.success(`${files.length} файл(ов) загружено`)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-2xl">{t('documents.title')}</h1>
          <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">{filteredDocuments.length} документов{selectedCar ? ` · ${cars.find(c => c.id === selectedCar)?.brand || ''}` : ''}</p>
        </div>
      </div>

      {/* Upload */}
      {cars.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Upload className="h-4 w-4 text-surface-400" />
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Загрузить документ</span>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <DropdownSelect options={cars.map((c) => ({ value: c.id, label: `${c.brand} ${c.model}` }))} value={selectedCar} onChange={setSelectedCar} className="w-44" />
            <DropdownSelect options={Object.entries(categoryLabels).map(([v, l]) => ({ value: v, label: l }))} value={uploadCategory} onChange={setUploadCategory} className="w-44" />
          </div>
          {selectedCar && (
            <div className="mt-3 rounded-lg border-2 border-dashed border-surface-200 bg-surface-50/50 p-4 text-center transition-colors hover:border-primary-300 dark:border-surface-600 dark:bg-surface-800/50">
              <p className="text-xs text-surface-500 dark:text-surface-400">Перетащите файлы или нажмите для выбора</p>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="mt-2 w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary-600" onChange={(e) => e.target.files && handleUpload(Array.from(e.target.files))} />
            </div>
          )}
        </div>
      )}

      {/* Filter by car */}
      {cars.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <DropdownSelect
            options={[{ value: '', label: 'Все автомобили' }, ...cars.map((c) => ({ value: c.id, label: `${c.brand} ${c.model}` }))]}
            value={selectedCar}
            onChange={setSelectedCar}
            className="w-48"
          />
        </div>
      )}

      {/* Filter by category */}
      {documents.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterCategory('all')}
            className={clsx('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', filterCategory === 'all' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400' : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700/50')}
          >
            Все ({documents.length})
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => {
            const count = documents.filter(d => d.category === key).length
            if (count === 0) return null
            return (
              <button
                key={key}
                onClick={() => setFilterCategory(key)}
                className={clsx('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', filterCategory === key ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400' : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700/50')}
              >
                {label} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Documents */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36" />)}</div>
      ) : filteredDocuments.length === 0 ? (
        <EmptyState icon={<FileText className="h-7 w-7" />} title={filterCategory === 'all' ? 'Нет документов' : 'Нет документов в этой категории'} description="Загрузите первый документ" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 page-enter-stagger">
          {filteredDocuments.map((doc) => {
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.name)
            const isPdf = /\.pdf$/i.test(doc.name)
            const fileUrl = resolveFileUrl(doc.file_url)
            return (
              <div key={doc.id} className="card overflow-hidden p-4">
                {/* Preview */}
                {isImage && fileUrl && (
                  <div className="mb-3 -mx-4 -mt-4 aspect-video overflow-hidden bg-surface-100 dark:bg-surface-700">
                    <img src={fileUrl} alt={doc.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                )}
                {isPdf && (
                  <div className="mb-3 flex h-20 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/20">
                    <FileText className="h-8 w-8 text-red-400" />
                  </div>
                )}
                {!isImage && !isPdf && (
                  <div className="mb-3 flex h-20 items-center justify-center rounded-lg bg-surface-100 dark:bg-surface-700">
                    <File className="h-8 w-8 text-surface-400" />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', categoryColors[doc.category] || categoryColors.other)}>
                    <FileText className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-100">{doc.name}</p>
                    <Badge size="sm">{categoryLabels[doc.category]}</Badge>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <a href={fileUrl} target="_blank" rel="noopener" className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full" iconLeft={<Eye />}>Открыть</Button>
                  </a>
                  <button
                    onClick={() => { if (confirm('Удалить документ?')) deleteDocument.mutate(doc.id, { onSuccess: () => toast.success('Документ удалён') }) }}
                    className="shrink-0 rounded-lg p-2 text-surface-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={showTierModal} onClose={() => setShowTierModal(false)} title="Лимит тарифа" size="sm">
        <p className="text-sm text-surface-500">На бесплатном тарифе — максимум {MAX_DOCS_FREE} документов.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowTierModal(false)}>Закрыть</Button>
          <Button onClick={() => { setShowTierModal(false); window.location.href = '/pricing' }}>Обновить тариф</Button>
        </div>
      </Modal>
    </div>
  )
}
