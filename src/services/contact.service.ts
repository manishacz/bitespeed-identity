import * as repo from '../repositories/contact.repository'
import { ContactResponse } from '../types'

export const identifyContact = async (
  email?: string | null,
  phoneNumber?: string | null
): Promise<ContactResponse> => {

  // check if there are any matches
  const matches = await repo.findMatchingContacts(email, phoneNumber)

  // check if there are no matches → create new primary
  if (matches.length === 0) {
    const newContact = await repo.createContact(email, phoneNumber, null, 'primary')
    return buildResponse(newContact.id, [newContact])
  }

  // check if all primaries
  const primaryIds = new Set<number>()
  for (const contact of matches) {
    if (contact.linkPrecedence === 'primary') {
      primaryIds.add(contact.id)
    } else if (contact.linkedId) {
      primaryIds.add(contact.linkedId)
    }
  }

  // check if two separate primaries → merge them
  let resolvedPrimaryId: number | undefined
  if (primaryIds.size > 1) {
    const [first, second] = [...primaryIds]
    const firstContacts = await repo.findByPrimaryId(first!)
    const secondContacts = await repo.findByPrimaryId(second!)

    if (!firstContacts[0] || !secondContacts[0]) {
      throw new Error('Could not resolve primary contacts for merge')
    }

    const older = firstContacts[0].createdAt < secondContacts[0].createdAt
      ? first! : second!
    const newer = older === first ? second! : first!

    // Re-link all secondaries of newer primary to older
    await repo.relinkSecondaries(newer, older)
    // Demote newer primary to secondary
    await repo.updateToSecondary(newer, older)

    resolvedPrimaryId = older
  }

  // Now we work with the one true primary
  const primaryId = resolvedPrimaryId ?? [...primaryIds][0]
  if (primaryId === undefined) throw new Error('Could not resolve a primary contact ID')
  let allContacts = await repo.findByPrimaryId(primaryId)

  //Checking if incoming request has new info
  const existingEmails = new Set(allContacts.map(c => c.email).filter(Boolean))
  const existingPhones = new Set(allContacts.map(c => c.phoneNumber).filter(Boolean))

  const hasNewInfo =
    (email && !existingEmails.has(email)) ||
    (phoneNumber && !existingPhones.has(phoneNumber))

  if (hasNewInfo) {
    await repo.createContact(email, phoneNumber, primaryId, 'secondary')
    allContacts = await repo.findByPrimaryId(primaryId)
  }

  return buildResponse(primaryId, allContacts)
}

function buildResponse(primaryId: number, allContacts: any[]) {
  const primary = allContacts.find((c: any) => c.id === primaryId)!
  const secondaries = allContacts.filter((c: any) => c.id !== primaryId)

  const emails = [
    primary.email,
    ...secondaries.map((c: any) => c.email)
  ].filter((v, i, a) => v && a.indexOf(v) === i) as string[]

  const phoneNumbers = [
    primary.phoneNumber,
    ...secondaries.map((c: any) => c.phoneNumber)
  ].filter((v, i, a) => v && a.indexOf(v) === i) as string[]

  return {
    contact: {
      primaryContatctId: primaryId,
      emails,
      phoneNumbers,
      secondaryContactIds: secondaries.map((c: any) => c.id)
    }
  }
}