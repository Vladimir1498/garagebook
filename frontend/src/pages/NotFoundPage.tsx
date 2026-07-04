import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div className="text-center">
        <p className="text-6xl font-bold text-surface-200 dark:text-surface-700">404</p>
        <h1 className="mt-4 text-2xl font-bold text-surface-900 dark:text-white">Страница не найдена</h1>
        <p className="mt-2 text-surface-500">Запрашиваемая страница не существует</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>На главную</Button>
        </Link>
      </div>
    </div>
  )
}
