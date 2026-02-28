import { Request, Response } from 'express'
import { identifyContact } from '../services/contact.service'

export const identify = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'At least one of email or phoneNumber is required' })
  }

  try {
    const result = await identifyContact(email, phoneNumber)
    return res.status(200).json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}