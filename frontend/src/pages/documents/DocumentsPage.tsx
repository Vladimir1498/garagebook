import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Trash2, Eye, Lock, Upload, Filter } from 'lucide-react'
import { useDocumentsList, useUploadDocument, useDeleteDocument } from '../../hooks/useDocuments'
import { useCars } from '../../hooks/useCars'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import Badge from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import { resolveFileUrl } from '../../utils/resolveFileUrl'

const categoryLabels: Record<string, string> = {
  insurance: 'Страховка', sts: 'СТС', diagnostics: 'Диагностика',
  work_order: 'Заказ-наряд', receipt: 'Чек', other: 'Прочее',
}

const categoryOrder = ['insurance', 'sts', 'work_order', 'diagnostics', 'receipt', 'other']

export default function DocumentsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useDocumentsList()
  const { data: carsData } = useCars()
  const uploadDocument = useUploadDocument()
  const deleteDocument = useDeleteDocument()

  const documents = data?.data?.data || []
  const cars = carsData?.data?.data || []
  const [selectedCar, setSelectedCar] = useState(cars[0]?.id || '')
  const [showTierModal, setShowTierModal] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [uploadCategory, setUploadCategory] = useState('other')

  // Sort documents by type
  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => {
      const aIdx = categoryOrder.indexOf(a.category)
      const bIdx = categoryOrder.indexOf(b.category)
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx)
    })
  }, [documents])

  // Filter by category
  const filteredDocuments = useMemo(() => {
    if (filterCategory === 'all') return sortedDocuments
    return sortedDocuments.filter((doc) => doc.category === filterCategory)
  }, [sortedDocuments, filterCategory])

  const MAX_DOCS_FREE = 5

  const handleUpload = async (files: File[]) => {
    if (!selectedCar) { toast.error('Выберите автомобиль'); return }
    // Check limit on frontend too
    if (documents.length + files.length > MAX_DOCS_FREE) {
      setShowTierModal(true)
      return
    }
    for (const file of files) {
      try {
        await uploadDocument.mutateAsync({ carId: selectedCar, file, category: uploadCategory, name: file.name })
      } catch (err: any) {
        if (err.response?.status === 403) {
          setShowTierModal(true)
          return
        }
        toast.error(err.response?.data?.detail || 'Ошибка загрузки')
      }
    }
    toast.success(`${files.length} файл(ов) загружено`)
  }

  const handleDelete = (docId: string) => {
    if (!confirm('Удалить документ?')) return
    deleteDocument.mutate(docId, {
      onSuccess: () => toast.success('Документ удалён'),
      onError: () => toast.error('Ошибка удаления'),
    })
  }

  return (
    <PageWrapper title={t('documents.title')}>
      {cars.length > 0 && (
        <div className="mb-6 space-y-4">
          {/* Upload section */}
          <div className="rounded-2xl border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300">
                <Upload className="h-4 w-4" /> Загрузить документ
              </div>
              <div className="flex items-center gap-2">
                {documents.length >= MAX_DOCS_FREE && (
                  <span className="text-xs text-amber-600 dark:text-amber-400">Лимит достигнут</span>
                )}
                <span className="text-xs text-surface-400">{documents.length} / {MAX_DOCS_FREE} документов</span>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-3 mb-3">
              <Select options={cars.map((c) => ({ value: c.id, label: `${c.brand} ${c.model}` }))} value={selectedCar} onChange={(e) => setSelectedCar(e.target.value)} className="w-48" />
              <Select label="Тип документа" options={Object.entries(categoryLabels).map(([v, l]) => ({ value: v, label: l }))} value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} className="w-48" />
            </div>
            {selectedCar && (
              <div className="rounded-xl border-2 border-dashed border-surface-200 bg-surface-50 p-6 text-center dark:border-surface-600 dark:bg-surface-800">
                <p className="text-sm text-surface-500">Перетащите файлы сюда или нажмите для выбора</p>
                <p className="mt-1 text-xs text-surface-400">Тип: <Badge>{categoryLabels[uploadCategory]}</Badge></p>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="mt-3 w-full text-sm" onChange={(e) => e.target.files && handleUpload(Array.from(e.target.files))} />
              </div>
            )}
          </div>

          {/* Filter */}
          {documents.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-surface-400" />
              <Select options={[{ value: 'all', label: 'Все типы' }, ...Object.entries(categoryLabels).map(([v, l]) => ({ value: v, label: l }))]} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-40" />
            </div>
          )}
        </div>
      )}

      {/* Documents list */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : filteredDocuments.length === 0 ? (
        <EmptyState icon={<FileText className="h-12 w-12" />} title="Нет документов" description="Загрузите первый документ" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="group rounded-2xl border border-surface-200 bg-white p-4 shadow-card transition-all hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-800">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-xl bg-red-50 p-2 text-red-500 dark:bg-red-900/20">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-surface-900 dark:text-white">{doc.name}</p>
                  <Badge>{categoryLabels[doc.category]}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={resolveFileUrl(doc.file_url)} target="_blank" rel="noopener" className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full"><Eye className="h-3.5 w-3.5" />Открыть</Button>
                </a>
                <button onClick={() => handleDelete(doc.id)} className="rounded-lg p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showTierModal} onClose={() => setShowTierModal(false)} title="Лимит тарифа" size="sm">
        <div className="space-y-3">
          <p className="text-sm text-surface-600">На бесплатном тарифе максимальное количество документов — <strong>5</strong>.</p>
          <p className="text-sm text-surface-500">У вас уже загружено <strong>{documents.length}</strong> документов.</p>
          <p className="text-sm text-surface-500">Обновите тариф для неограниченного хранения документов.</p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowTierModal(false)}>Закрыть</Button>
          <Button onClick={() => window.location.href = '/settings'}>Обновить тариф</Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
