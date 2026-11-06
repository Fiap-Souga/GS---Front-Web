import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createFileRepositories } from './data/fileRepositories.js'

const temporaryDirectories = []

const createTemporaryRepositories = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'raiz-urbana-'))
  temporaryDirectories.push(directory)
  return {
    filePath: join(directory, 'users.json'),
    ...(await createFileRepositories(join(directory, 'users.json'))),
  }
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => (
    rm(directory, { recursive: true, force: true })
  )))
})

describe('persistência local em JSON', () => {
  it('grava contas e árvore no arquivo sem armazenar a senha original', async () => {
    const { filePath, userRepository } = await createTemporaryRepositories()
    const user = await userRepository.create({
      name: 'Ana Verde',
      email: 'ana@example.com',
      passwordHash: 'bcrypt-hash',
    })
    await userRepository.addTreeVisit(user.id, {
      place: 'Parque Ibirapuera',
      visitedAt: '2026-11-06T00:00:00.000Z',
    }, 1000)

    const persisted = JSON.parse(await readFile(filePath, 'utf8'))
    expect(persisted.users[0].email).toBe('ana@example.com')
    expect(persisted.users[0].passwordHash).toBe('bcrypt-hash')
    expect(persisted.users[0].password).toBeUndefined()
    expect(persisted.users[0].treeVisits).toHaveLength(1)
  })

  it('mantém os planos privados e carrega os dados após reiniciar o repositório', async () => {
    const { filePath, userRepository, planRepository } = await createTemporaryRepositories()
    const ana = await userRepository.create({
      name: 'Ana Verde',
      email: 'ana@example.com',
      passwordHash: 'hash-ana',
    })
    const bia = await userRepository.create({
      name: 'Bia Verde',
      email: 'bia@example.com',
      passwordHash: 'hash-bia',
    })
    const plan = await planRepository.create({
      owner: ana.id,
      title: 'Mutirão de plantio',
      body: 'Plantar espécies nativas.',
      userId: 1,
    })

    const restarted = await createFileRepositories(filePath)
    expect(await restarted.planRepository.findByOwner(ana.id)).toHaveLength(1)
    expect(await restarted.planRepository.findByOwner(bia.id)).toEqual([])
    expect(await restarted.planRepository.updateByOwner(plan.id, bia.id, {
      title: 'Acesso indevido',
    })).toBeNull()
    expect(await restarted.planRepository.deleteByOwner(plan.id, ana.id)).not.toBeNull()
    expect(await restarted.planRepository.findByOwner(ana.id)).toEqual([])
  })

  it('mantém hábitos isolados por conta e persistidos após reiniciar a API', async () => {
    const { filePath, userRepository } = await createTemporaryRepositories()
    const ana = await userRepository.create({
      name: 'Ana Verde',
      email: 'ana@example.com',
      passwordHash: 'hash-ana',
    })
    const bia = await userRepository.create({
      name: 'Bia Verde',
      email: 'bia@example.com',
      passwordHash: 'hash-bia',
    })
    const entry = {
      date: '2026-11-06',
      exerciseMinutes: 30,
      waterLiters: 1.5,
      steps: 4000,
    }
    await userRepository.upsertHabitEntry(ana.id, entry)
    await userRepository.upsertHabitEntry(ana.id, { ...entry, exerciseMinutes: 45 })

    const restarted = await createFileRepositories(filePath)
    expect((await restarted.userRepository.findById(ana.id)).habitEntries).toEqual([
      { ...entry, exerciseMinutes: 45 },
    ])
    expect((await restarted.userRepository.findById(bia.id)).habitEntries).toEqual([])
    await restarted.userRepository.deleteHabitEntry(ana.id, entry.date)
    expect((await restarted.userRepository.findById(ana.id)).habitEntries).toEqual([])
  })

  it('serializa gravações simultâneas sem perder contas', async () => {
    const { userRepository, filePath } = await createTemporaryRepositories()
    await Promise.all(Array.from({ length: 12 }, (_, index) => userRepository.create({
      name: `Pessoa ${index}`,
      email: `pessoa${index}@example.com`,
      passwordHash: `hash-${index}`,
    })))

    const persisted = JSON.parse(await readFile(filePath, 'utf8'))
    expect(persisted.users).toHaveLength(12)
  })

  it('rejeita dados locais corrompidos sem sobrescrevê-los', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'raiz-urbana-corrupt-'))
    temporaryDirectories.push(directory)
    const filePath = join(directory, 'users.json')
    await writeFile(filePath, '{invalid', 'utf8')

    await expect(createFileRepositories(filePath)).rejects.toThrow('Não foi possível ler')
    await expect(readFile(filePath, 'utf8')).resolves.toBe('{invalid')
  })
})
