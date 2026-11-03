import type { MediaCondition } from '../types'

/**
 * Latin Square counterbalancing for 3 conditions
 * Generates all 6 possible orders (3! = 6)
 */
const LATIN_SQUARE_ORDERS: MediaCondition[][] = [
  ['video', 'audio', 'text'],
  ['video', 'text', 'audio'],
  ['audio', 'video', 'text'],
  ['audio', 'text', 'video'],
  ['text', 'video', 'audio'],
  ['text', 'audio', 'video'],
]

/**
 * Gets the condition order using Latin Square method
 * Uses participant counter to ensure balanced distribution
 * @param participantCounter - Sequential number of participant (1, 2, 3, ...)
 * @returns Condition order for this participant
 */
export function getLatinSquareOrder(participantCounter: number): MediaCondition[] {
  // Use modulo to cycle through the 6 orders
  const orderIndex = (participantCounter - 1) % LATIN_SQUARE_ORDERS.length
  return [...LATIN_SQUARE_ORDERS[orderIndex]]
}

/**
 * Gets the order number (1-6) for a given participant
 */
export function getOrderNumber(participantCounter: number): number {
  return ((participantCounter - 1) % LATIN_SQUARE_ORDERS.length) + 1
}

/**
 * Gets all possible orders (for reference/analysis)
 */
export function getAllOrders(): MediaCondition[][] {
  return LATIN_SQUARE_ORDERS.map((order) => [...order])
}
