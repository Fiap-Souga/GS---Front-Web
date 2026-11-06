import React, { useMemo, useState } from 'react'
import { useCommunityRecords } from '../hooks/useCommunityRecords.js'
import { useDialogDismiss } from '../hooks/useDialogDismiss.js'
import { useRecordForm } from '../hooks/useRecordForm.js'
import { getCurrentSession } from '../services/authApi.js'
import '../react.css'

const REGIONS = [
  { id: 1, name: 'Pinheiros' },
  { id: 2, name: 'Centro Histórico' },
  { id: 3, name: 'Vila Madalena' },
]

const locationIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" />
  </svg>
)

function ApiNotice({ isSignedIn }) {
  return (
    <aside className="api-demo-notice" role="note">
      <span aria-hidden="true">ⓘ</span>
      <span>{isSignedIn
        ? 'Seus planos são privados e ficam salvos no MongoDB da sua conta.'
        : 'Modo demonstração: a API externa JSONPlaceholder simula gravações. Entre ou crie uma conta para salvar seus próprios planos.'}</span>
    </aside>
  )
}

function RecordForm({ record, isSaving, onCancel, onSubmit }) {
  const form = useRecordForm(record)
  const submit = (event) => {
    event.preventDefault()
    Promise.resolve(form.submit(onSubmit)).catch(() => {})
  }

  return (
    <form className="record-form" onSubmit={submit}>
      <label>
        Título da ação
        <input autoFocus maxLength={100} value={form.title} onChange={(event) => form.setTitle(event.target.value)} placeholder="Ex.: Mutirão de plantio na praça" />
      </label>
      <label>
        Descrição
        <textarea maxLength={500} value={form.description} onChange={(event) => form.setDescription(event.target.value)} placeholder="Conte o que a comunidade pode fazer." />
      </label>
      <label>
        Região
        <select value={form.region} onChange={(event) => form.setRegion(event.target.value)}>
          {REGIONS.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
        </select>
      </label>
      {form.validationError && <p className="record-form-error" role="alert">{form.validationError}</p>}
      <div className="record-dialog-actions">
        <button className="record-cancel-button" type="button" onClick={onCancel}>Cancelar</button>
        <button className="record-save-button" type="submit" disabled={isSaving}>
          {isSaving ? 'Salvando...' : record ? 'Salvar alterações' : 'Criar ação'}
        </button>
      </div>
    </form>
  )
}

function RecordEditor({ record, isSaving, onClose, onSubmit }) {
  const isEditing = Boolean(record)
  useDialogDismiss(onClose, isSaving)
  return (
    <div className="record-dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isSaving) onClose()
    }}>
      <section className="record-dialog" role="dialog" aria-modal="true" aria-labelledby="record-editor-title">
        <h3 id="record-editor-title">{isEditing ? 'Editar ação comunitária' : 'Nova ação comunitária'}</h3>
        <p>Compartilhe uma atividade para aproximar a comunidade das áreas verdes.</p>
        <RecordForm
          record={record}
          isSaving={isSaving}
          onCancel={onClose}
          onSubmit={async (values) => {
            await onSubmit(values)
            onClose()
          }}
        />
      </section>
    </div>
  )
}

function DeleteConfirmation({ record, isSaving, onCancel, onConfirm }) {
  useDialogDismiss(onCancel, !record || isSaving)
  if (!record) return null
  return (
    <div className="record-dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isSaving) onCancel()
    }}>
      <section className="record-dialog record-delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
        <h3 id="delete-title">Excluir esta ação?</h3>
        <p><strong>{record.title}</strong> será removida desta demonstração.</p>
        <div className="record-delete-actions">
          <button className="record-cancel-button" type="button" disabled={isSaving} onClick={onCancel}>Cancelar</button>
          <button className="record-delete-confirm" type="button" disabled={isSaving} onClick={onConfirm}>{isSaving ? 'Excluindo...' : 'Excluir ação'}</button>
        </div>
      </section>
    </div>
  )
}

function RecordFilter({ search, region, onSearch, onRegion }) {
  return (
    <div className="records-toolbar">
      <label className="visually-hidden" htmlFor="record-search">Buscar ações</label>
      <input id="record-search" className="records-search" type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar uma ação..." />
      <label className="visually-hidden" htmlFor="record-region-filter">Filtrar por região</label>
      <select id="record-region-filter" className="records-region" value={region} onChange={(event) => onRegion(event.target.value)}>
        <option value="all">Todas as regiões</option>
        {REGIONS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </div>
  )
}

function RecordCard({ record, isSaving, onEdit, onDelete }) {
  const region = REGIONS.find((item) => item.id === Number(record.userId))?.name ?? 'Comunidade'
  return (
    <article className="record-card">
      <div className="record-card-top">
        <span className="record-region-tag">{locationIcon}{region}</span>
      </div>
      <h3>{record.title}</h3>
      <p>{record.body}</p>
      <div className="record-card-actions">
        <button type="button" disabled={isSaving} onClick={() => onEdit(record)}>Editar</button>
        <button type="button" disabled={isSaving} onClick={() => onDelete(record)}>Excluir</button>
      </div>
    </article>
  )
}

function RecordList({ records, isSaving, onEdit, onDelete }) {
  if (records.length === 0) {
    return <p className="record-empty">Nenhuma ação encontrada. Ajuste os filtros ou crie uma nova iniciativa.</p>
  }
  return (
    <div className="records-list">
      {records.map((record) => (
        <RecordCard key={record.id} record={record} isSaving={isSaving} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}

export function CommunityRecordsApp() {
  const isSignedIn = Boolean(getCurrentSession())
  const {
    records,
    isLoading,
    isSaving,
    error,
    clearError,
    refreshRecords,
    addRecord,
    editRecord,
    removeRecord,
  } = useCommunityRecords()
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('all')
  const [editingRecord, setEditingRecord] = useState(undefined)
  const [deletingRecord, setDeletingRecord] = useState(null)

  const filteredRecords = useMemo(() => records.filter((record) => {
    const matchesText = `${record.title} ${record.body}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))
    const matchesRegion = region === 'all' || Number(record.userId) === Number(region)
    return matchesText && matchesRegion
  }), [records, search, region])

  const saveRecord = async (record) => {
    if (record.id) await editRecord(record)
    else await addRecord(record)
  }

  const confirmDelete = async () => {
    try {
      await removeRecord(deletingRecord)
      setDeletingRecord(null)
    } catch {
      // The hook exposes the request error in the page banner.
    }
  }

  return (
    <section className="community-records mt-4 rounded-lg border border-[#e5e9df] bg-[#fbfcf8] p-5 shadow-sm sm:p-6" aria-labelledby="community-records-title">
      <div className="records-header">
        <div>
          <span className="profile-eyebrow">INICIATIVAS DO BAIRRO</span>
          <h2 id="community-records-title">Ações da comunidade</h2>
          <p>{isSignedIn ? 'Organize suas próprias atividades de cuidado com parques e praças.' : 'Explore atividades demonstrativas ou entre na sua conta para criar planos pessoais.'}</p>
        </div>
        <span className="records-count" aria-live="polite">{records.length} ações</span>
      </div>
      <ApiNotice isSignedIn={isSignedIn} />
      {error && (
        <div className="record-error" role="alert">
          <span>{error}</span>
          <button type="button" aria-label="Fechar mensagem de erro" onClick={clearError}>×</button>
        </div>
      )}
      <RecordFilter search={search} region={region} onSearch={setSearch} onRegion={setRegion} />
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
        <span className="text-xs text-[#7d8778]" aria-live="polite">{filteredRecords.length} de {records.length} ações</span>
        <div className="flex gap-2">
          <button className="record-cancel-button" type="button" disabled={isLoading || isSaving} onClick={() => refreshRecords()}>{isLoading ? 'Atualizando...' : 'Atualizar'}</button>
          <button className="record-new-button" type="button" disabled={isSaving} onClick={() => setEditingRecord(null)}>+ Nova ação</button>
        </div>
      </div>
      {isLoading
        ? <p className="records-status" role="status">Carregando ações da API...</p>
        : <RecordList records={filteredRecords} isSaving={isSaving} onEdit={setEditingRecord} onDelete={setDeletingRecord} />}
      {editingRecord !== undefined && (
        <RecordEditor
          record={editingRecord}
          isSaving={isSaving}
          onClose={() => setEditingRecord(undefined)}
          onSubmit={saveRecord}
        />
      )}
      <DeleteConfirmation
        record={deletingRecord}
        isSaving={isSaving}
        onCancel={() => setDeletingRecord(null)}
        onConfirm={confirmDelete}
      />
    </section>
  )
}
