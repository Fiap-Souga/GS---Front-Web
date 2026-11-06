import { useEffect } from 'react'

export function useDialogDismiss(onDismiss, disabled = false) {
  useEffect(() => {
    if (disabled) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onDismiss()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onDismiss, disabled])
}
