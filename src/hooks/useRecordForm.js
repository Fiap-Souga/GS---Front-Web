import { useState } from 'react'

export function useRecordForm(record) {
  const [title, setTitle] = useState(record?.title ?? '')
  const [description, setDescription] = useState(record?.body ?? '')
  const [region, setRegion] = useState(String(record?.userId ?? '1'))
  const [validationError, setValidationError] = useState('')

  const updateTitle = (value) => {
    setTitle(value)
    setValidationError('')
  }

  const updateDescription = (value) => {
    setDescription(value)
    setValidationError('')
  }

  const submit = (onSubmit) => {
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    if (!trimmedTitle || !trimmedDescription) {
      setValidationError('Preencha o título e a descrição da ação.')
      return
    }
    return onSubmit({
      ...(record ?? {}),
      title: trimmedTitle,
      body: trimmedDescription,
      userId: Number(region),
    })
  }

  return {
    title,
    description,
    region,
    validationError,
    setTitle: updateTitle,
    setDescription: updateDescription,
    setRegion,
    submit,
  }
}
