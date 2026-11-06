import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createRecord as createRecordRequest,
  deleteRecord as deleteRecordRequest,
  getRecords,
  updateRecord as updateRecordRequest,
} from '../services/recordsApi.js'
import { getCurrentSession } from '../services/authApi.js'

let nextLocalId = 0

export function useCommunityRecords() {
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const refreshSequence = useRef(0)

  const refreshRecords = useCallback(async (signal) => {
    const requestId = ++refreshSequence.current
    const sessionIdAtStart = getCurrentSession()?.id ?? null
    setIsLoading(true)
    setError('')
    try {
      const fetchedRecords = await getRecords(signal)
      const currentSessionId = getCurrentSession()?.id ?? null
      if (requestId === refreshSequence.current && sessionIdAtStart === currentSessionId) {
        setRecords(fetchedRecords)
      }
    } catch (requestError) {
      if (requestError.name === 'AbortError') return
      const currentSessionId = getCurrentSession()?.id ?? null
      if (requestId === refreshSequence.current && sessionIdAtStart === currentSessionId) {
        setError(requestError.message || 'Não foi possível consultar os registros.')
      }
    } finally {
      if (!signal?.aborted && requestId === refreshSequence.current) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    refreshRecords(controller.signal)
    return () => controller.abort()
  }, [refreshRecords])

  useEffect(() => {
    const handleSessionChange = () => {
      setRecords([])
      setError('')
      refreshRecords()
    }
    window.addEventListener('raiz-urbana:session', handleSessionChange)
    return () => window.removeEventListener('raiz-urbana:session', handleSessionChange)
  }, [refreshRecords])

  const runMutation = async (request, applyChanges) => {
    const sessionIdAtStart = getCurrentSession()?.id ?? null
    setIsSaving(true)
    setError('')
    try {
      const result = await request()
      applyChanges(result)
    } catch (requestError) {
      if (sessionIdAtStart === (getCurrentSession()?.id ?? null)) {
        setError(requestError.message || 'Não foi possível salvar as alterações.')
      }
      throw requestError
    } finally {
      setIsSaving(false)
    }
  }

  const addRecord = (record) => {
    const sessionIdAtStart = getCurrentSession()?.id ?? null
    return runMutation(
      () => createRecordRequest(record),
      (result) => {
        if (sessionIdAtStart !== (getCurrentSession()?.id ?? null)) return
        setRecords((current) => sessionIdAtStart
          ? [result, ...current]
          : [{
            ...record,
            id: `demo-${Date.now()}-${nextLocalId++}`,
            apiId: result.id,
          }, ...current])
      },
    )
  }

  const editRecord = (record) => {
    const sessionIdAtStart = getCurrentSession()?.id ?? null
    return runMutation(
      () => updateRecordRequest(record),
      () => {
        if (sessionIdAtStart !== (getCurrentSession()?.id ?? null)) return
        setRecords((current) => current.map((item) => item.id === record.id
          ? { ...item, title: record.title, body: record.body, userId: record.userId }
          : item))
      },
    )
  }

  const removeRecord = (record) => {
    const sessionIdAtStart = getCurrentSession()?.id ?? null
    return runMutation(
      () => deleteRecordRequest(record),
      () => {
        if (sessionIdAtStart !== (getCurrentSession()?.id ?? null)) return
        setRecords((current) => current.filter((item) => item.id !== record.id))
      },
    )
  }

  return {
    records,
    isLoading,
    isSaving,
    error,
    clearError: () => setError(''),
    refreshRecords,
    addRecord,
    editRecord,
    removeRecord,
  }
}
