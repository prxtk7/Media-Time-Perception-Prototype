const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomChar() {
  const index = Math.floor(Math.random() * ALPHABET.length)
  return ALPHABET[index]
}

export function generateParticipantId(prefix = 'PT', length = 6) {
  let body = ''
  for (let i = 0; i < length; i += 1) {
    body += randomChar()
  }
  return `${prefix}-${body}`
}



