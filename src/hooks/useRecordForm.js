import { useState } from 'react'

const localDate = () => {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

export function useRecordForm(record) {
  const [title, setTitle] = useState(record?.title ?? '')
  const [description, setDescription] = useState(record?.body ?? '')
  const [place, setPlace] = useState(record?.place ?? '')
  const [date, setDate] = useState(record?.date ?? record?.createdAt?.slice(0, 10) ?? localDate())
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

  const updatePlace = (value) => {
    setPlace(value)
    setValidationError('')
  }

  const updateDate = (value) => {
    setDate(value)
    setValidationError('')
  }

  const submit = (onSubmit) => {
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    const trimmedPlace = place.trim()
    if (!trimmedTitle || !trimmedDescription || !trimmedPlace || !date) {
      setValidationError('Preencha o título, a descrição, o local e a data da ação.')
      return
    }
    return onSubmit({
      ...(record ?? {}),
      title: trimmedTitle,
      body: trimmedDescription,
      place: trimmedPlace,
      date,
      userId: Number(region),
    })
  }

  return {
    title,
    description,
    place,
    date,
    region,
    validationError,
    setTitle: updateTitle,
    setDescription: updateDescription,
    setPlace: updatePlace,
    setDate: updateDate,
    setRegion,
    submit,
  }
}
