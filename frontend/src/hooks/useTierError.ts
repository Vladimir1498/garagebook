import { useEffect, useState } from 'react'

interface TierError {
  is403: boolean
  message: string
}

export function useTierError(error: any): TierError {
  const [tierError, setTierError] = useState<TierError>({ is403: false, message: '' })

  useEffect(() => {
    if (error?.response?.status === 403) {
      setTierError({
        is403: true,
        message: error.response.data?.detail || 'Функция доступна на более высоком тарифе'
      })
    } else {
      setTierError({ is403: false, message: '' })
    }
  }, [error])

  return tierError
}
