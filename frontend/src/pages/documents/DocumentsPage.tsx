import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Download, Trash2, Eye } from 'lucide-react'
import { useDocumentsList, useUploadDocument, useDeleteDocument } from '../../hooks/useDocuments'
import { useCars } from '../../hooks/useCars'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import Badge from '../../components/ui/Badge'
import FileDropzone from '../../components/ui/FileDropzone'
import Select from '../../components/ui/Select'
import toast from 'react-hot-toast'

const categoryLabels: Record<string, string> = {
  insurance: 'Страховка', sts: 'СТС', diagnostics: 'Диагностика',
  work_order: 'Заказ-наряд', receipt: 'Чек', other: 'Прочее',
}

export default function DocumentsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useDocumentsList()
  const { data: carsData } = useCars()
  const uploadDocument = useUploadDocument()
  const deleteDocument = useDeleteDocument()

  const documents = data?.data?.data || []
  const cars = carsData?.data?.data || []
  const [selectedCar, setSelectedCar] = useState(cars[0]?.id || '')
  const [category, setCategory] = useState('other')

  const handleUpload = async (files: File[]) => {
    if (!selectedCar) { toast.error('Выберите автомобиль'); return }
    for (const file of files) {
      try {
        await uploadDocument.mutateAsync({ carId: selectedCar, file, category, name: file.name })
      } catch {}
    }
    toast.success(`${files.length} файл(ов) загружено`)
  }

  return (
    <PageWrapper title={t('documents.title')}>
      {cars.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Select options={cars.map((c) => ({ value: c.id, label: `${c.brand} ${c.model}` }))} value={selectedCar} onChange={(e) => setSelectedCar(e.target.value)} className="w-48" />
          <Select options={Object.entries(categoryLabels).map(([v, l]) => ({ value: v, label: l }))} value={category} onChange={(e) => setCategory(e.target.value)} className="w-40" />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : documents.length === 0 ? (
        <EmptyState icon={<FileText className="h-12 w-12" />} title="Нет документов" description="Загрузите первый документ" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
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
                <a href={encodeURI(doc.file_url)} target="_blank" rel="noopener" className="flex-1"><Button variant="secondary" size="sm" className="w-full"><Eye className="h-3.5 w-3.5" />Открыть</Button></a>
                <button onClick={() => deleteDocument.mutate(doc.id)} className="rounded-lg p-2 text-surface-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCar && (
        <div className="mt-6">
          <FileDropzone onFiles={handleUpload} accept=".pdf,.jpg,.jpeg,.png" multiple />
        </div>
      )}
    </PageWrapper>
  )
}
