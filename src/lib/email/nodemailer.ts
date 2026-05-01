import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NEXT_EMAIL_USER ,
    pass: process.env.NEXT_EMAIL_PASSWORD,
  },
})

export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.NEXT_EMAIL_USER,
    to,
    subject,
    text,
  })
}
