import { authenticatedRequest, getCurrentSession } from './authApi.js'

const DEMO_RECORDS = [
  {
    id: 1,
    title: 'Mutirão de plantio na praça',
    body: 'Vamos plantar mudas de espécies nativas e deixar a praça mais verde. Traga luvas, uma garrafa de água e disposição para colaborar!',
    userId: 1,
  },
  {
    id: 2,
    title: 'Cuidado coletivo com o parque',
    body: 'Encontro para recolher resíduos, cuidar dos canteiros e conversar sobre como manter o parque agradável para toda a vizinhança.',
    userId: 2,
  },
  {
    id: 3,
    title: 'Horta comunitária para todos',
    body: 'Participe do preparo dos canteiros, do plantio de temperos e da troca de dicas para cuidar da horta comunitária.',
    userId: 3,
  },
  {
    id: 4,
    title: 'Compostagem no bairro',
    body: 'Aprenda a separar resíduos orgânicos e a transformá-los em adubo para as plantas da praça. Atividade aberta para iniciantes.',
    userId: 1,
  },
  {
    id: 5,
    title: 'Caminhada de observação da natureza',
    body: 'Um passeio tranquilo para observar as árvores, conhecer as áreas verdes do bairro e compartilhar ideias para preservá-las.',
    userId: 2,
  },
  {
    id: 6,
    title: 'Oficina de jardins para polinizadores',
    body: 'Vamos montar um pequeno jardim com plantas que ajudam abelhas e borboletas. Cada pessoa pode trazer uma muda ou semente.',
    userId: 3,
  },
  {
    id: 7,
    title: 'Roda de conversa sobre água',
    body: 'Encontro para trocar soluções simples de economia de água e conversar sobre a importância dos rios e nascentes da região.',
    userId: 1,
  },
  {
    id: 8,
    title: 'Sábado de brincadeiras ao ar livre',
    body: 'Uma manhã de jogos, leitura e convivência na praça. Traga uma canga, um livro ou uma brincadeira para compartilhar.',
    userId: 2,
  },
]

let nextDemoId = DEMO_RECORDS.length + 1

export const getRecords = async (signal) => {
  if (getCurrentSession()) {
    const data = await authenticatedRequest('/api/plans', { signal })
    if (!Array.isArray(data) || data.some((record) => (
      typeof record.id !== 'string'
      || typeof record.title !== 'string'
      || typeof record.body !== 'string'
    ))) {
      throw new Error('A API retornou dados em um formato inesperado.')
    }
    return data.map((record) => ({ ...record, apiId: record.id }))
  }

  if (signal?.aborted) throw new DOMException('A solicitação foi cancelada.', 'AbortError')
  return DEMO_RECORDS.map((record) => ({ ...record, apiId: record.id }))
}

export const createRecord = async (record) => {
  if (getCurrentSession()) {
    return authenticatedRequest('/api/plans', {
      method: 'POST',
      body: JSON.stringify(record),
    })
  }

  return { ...record, id: nextDemoId++ }
}

export const updateRecord = async (record) => {
  if (getCurrentSession()) {
    return authenticatedRequest(`/api/plans/${record.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        userId: record.userId,
        title: record.title,
        body: record.body,
      }),
    })
  }

  return record
}

export const deleteRecord = async (record) => {
  if (getCurrentSession()) {
    return authenticatedRequest(`/api/plans/${record.id}`, {
      method: 'DELETE',
    })
  }

  return null
}
