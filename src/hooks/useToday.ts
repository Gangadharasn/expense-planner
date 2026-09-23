import { useEffect, useState } from 'react'

/** Always uses the real current date/time from the device (not hardcoded). */
export function useToday(): Date {
  const [today, setToday] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setToday(new Date())
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [])

  return today
}
