import { formatDuration } from 'date-fns'

const getFormattedSpeed = (seconds: number) => {
  const days = Math.floor(seconds / (3600 * 24))
  const hours = Math.floor((seconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return formatDuration(
    {
      seconds: seconds % 60,
      days,
      hours,
      minutes
    },
    { format: ['days', 'hours', 'minutes', 'seconds'] }
  )
}

export default getFormattedSpeed
