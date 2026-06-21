import { createHash } from 'crypto'

const password = process.argv[2]
if (!password) {
  console.error('Usage: npm run hash-password -- <your-password>')
  process.exit(1)
}
console.log(createHash('sha256').update(password).digest('hex'))
