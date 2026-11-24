import { Prisma } from '../prisma/index.js';

export class AppointmentConflictError extends Error {
  constructor(message = 'Horário indisponível. Já existe um agendamento neste período.') {
    super(message);
    this.name = 'AppointmentConflictError';
  }
}

function extractErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  if ('code' in error && typeof error.code === 'string') {
    return error.code;
  }

  if ('cause' in error) {
    return extractErrorCode(error.cause);
  }

  return undefined;
}

export function isSerializationError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
    return true;
  }

  const code = extractErrorCode(error);
  return code === 'P2034' || code === '40001';
}