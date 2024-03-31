import 'dotenv/config'
import { z } from 'zod'

// Definindo um esquema de validação para as variáveis de ambiente
const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().default(3338),
})

// Validando as variáveis de ambiente com o esquema definido
const _env = envSchema.safeParse(process.env)

// Verificando se a validação foi bem-sucedida
if (_env.success === false) {
  // Se houver erro na validação, exibir mensagem de erro no console com detalhes do erro
  console.error('Variáveis de ambiente inválidas', _env.error.format())

  // Lançar um erro informando que as variáveis de ambiente são inválidas
  throw new Error('Variáveis de ambiente inválidas.')
}

// Exportando as variáveis de ambiente válidas
export const env = _env.data
