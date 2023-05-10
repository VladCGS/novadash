import { Injectable } from '@nestjs/common';
import * as Nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Nodemailer.Transporter;

  constructor() {
    this.transporter = Nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_SMTP_PORT),
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASS,
      },
    });
  }

  async sendMail(options: Nodemailer.SendMailOptions): Promise<void> {
    await this.transporter.sendMail(options);
  }
}
