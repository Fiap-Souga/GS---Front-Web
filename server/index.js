import 'dotenv/config'
import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { createFileRepositories } from './data/fileRepositories.js'

const start = async () => {
  const config = loadConfig()
  const { userRepository, planRepository } = await createFileRepositories(config.dataFile)

  const app = createApp({
    userRepository,
    planRepository,
    jwtSecret: config.jwtSecret,
    clientOrigins: config.clientOrigins,
    trustProxyHops: config.trustProxyHops,
  })
  const server = app.listen(config.port, '127.0.0.1', () => {
    console.info(`API Raiz Urbana disponível apenas neste computador na porta ${config.port}.`)
  })

  const shutdown = (signal) => {
    console.info(`${signal} recebido; encerrando a API.`)
    server.close(async (error) => {
      if (error) {
        console.error('Falha ao encerrar o servidor HTTP:', error)
        process.exitCode = 1
      }
    })
  }

  process.once('SIGINT', () => shutdown('SIGINT'))
  process.once('SIGTERM', () => shutdown('SIGTERM'))
}

start().catch((error) => {
  console.error('Não foi possível iniciar a API local.', error.message)
  process.exitCode = 1
})
