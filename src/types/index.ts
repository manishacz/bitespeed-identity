export interface IdentifyRequest {
  email?: string | null
  phoneNumber?: string | null
}

export interface ContactResponse {
  contact: {
    primaryContatctId: number
    emails: string[]
    phoneNumbers: string[]
    secondaryContactIds: number[]
  }
}