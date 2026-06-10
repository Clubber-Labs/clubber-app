import { useCallback, useEffect, useRef, useState } from 'react'

// Cooldown reutilizável (ex.: reenvio de OTP). Decrementa 1/s até zero.
// Mesma disciplina de cleanup do timer de banner.tsx.
export function useCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(
    (seconds: number) => {
      clear()
      setSecondsLeft(seconds)
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clear()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
    [clear],
  )

  const reset = useCallback(() => {
    clear()
    setSecondsLeft(0)
  }, [clear])

  useEffect(() => clear, [clear])

  return { secondsLeft, start, reset }
}
