import prisma from '../utils/prisma'

export const findMatchingContacts = async (email?: string | null, phoneNumber?: string | null) => {
  return prisma.contact.findMany({
    where: {
      deletedAt: null,
      OR: [
        ...(email ? [{ email }] : []),
        ...(phoneNumber ? [{ phoneNumber }] : [])
      ]
    },
    orderBy: { createdAt: 'asc' }
  })
}

export const findByPrimaryId = async (primaryId: number) => {
  return prisma.contact.findMany({
    where: {
      deletedAt: null,
      OR: [{ id: primaryId }, { linkedId: primaryId }]
    },
    orderBy: { createdAt: 'asc' }
  })
}

export const createContact = async (
  email: string | null | undefined,
  phoneNumber: string | null | undefined,
  linkedId: number | null,
  linkPrecedence: 'primary' | 'secondary'
) => {
  return prisma.contact.create({
    data: {
      email: email ?? null,
      phoneNumber: phoneNumber ?? null,
      linkedId,
      linkPrecedence
    }
  })
}

export const updateToSecondary = async (id: number, linkedId: number) => {
  return prisma.contact.update({
    where: { id },
    data: { linkedId, linkPrecedence: 'secondary', updatedAt: new Date() }
  })
}

export const relinkSecondaries = async (oldPrimaryId: number, newPrimaryId: number) => {
  return prisma.contact.updateMany({
    where: { linkedId: oldPrimaryId },
    data: { linkedId: newPrimaryId }
  })
}