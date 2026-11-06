import { useCallback, useEffect, useState } from 'react'
import {
  createRecord as createRecordRequest,
  deleteRecord as deleteRecordRequest,
  getRecords,
  updateRecord as updateRecordRequest,
} from '../services/recordsApi.js'

let nextLocalId = 0

export function useCommunityRecords() {
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const refreshRecords = useCallback(async (signal) => {
    setIsLoading(true)
    setError('')
    try {
      setRecords(await getRecords(signal))
    } catch (requestError) {
      if (requestError.name === 'AbortError') return
      setError(requestError.message || 'Não foi possível consultar os registros.')
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    refreshRecords(controller.signal)
    return () => controller.abort()
  }, [refreshRecords])

  const runMutation = async (request, applyChanges) => {
    setIsSaving(true)
    setError('')
    try {
      const result = await request()
      applyChanges(result)
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível salvar as alterações.')
      throw requestError
    } finally {
      setIsSaving(false)
    }
  }

  const addRecord = (record) => runMutation(
    () => createRecordRequest(record),
    (result) => setRecords((current) => [{
      ...record,
      id: `demo-${Date.now()}-${nextLocalId++}`,
      apiId: result.id,
    }, ...current]),
  )

  const editRecord = (record) => runMutation(
    () => updateRecordRequest(record),
    () => setRecords((current) => current.map((item) => item.id === record.id
      ? { ...item, title: record.title, body: record.body, userId: record.userId }
      : item)),
  )

  const removeRecord = (record) => runMutation(
    () => deleteRecordRequest(record),
    () => setRecords((current) => current.filter((item) => item.id !== record.id)),
  )

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
