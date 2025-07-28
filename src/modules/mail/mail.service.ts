import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailData } from './interfaces/mail-data.interface';

import * as path from 'path';
import { AllConfigType } from '../../config/config.type';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class MailService {
  private readonly APP_NAME = 'Fusion Pro';
  private readonly SUPPORT_EMAIL = 'support@fusionpro.com';

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async userSignUp(
    mailData: MailData<{ hash: string; tokenExpires: string }>,
  ): Promise<void> {
    const emailConfirmTitle = `Welcome to ${this.APP_NAME} - Verify Your Email`;

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `Your verification code: ${mailData.data.hash}. Valid for ${mailData.data.tokenExpires}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src/modules/mail/mail-templates/activation.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        hash: mailData.data.hash,
        tokenExpires: mailData.data.tokenExpires,
        SUPPORT_EMAIL: this.SUPPORT_EMAIL,
      },
    });
  }

  async forgotPassword(
    mailData: MailData<{ hash: string; tokenExpires: string }>,
  ): Promise<void> {
    const resetPasswordTitle = 'Secure Password Reset';

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: resetPasswordTitle,
      text: `Your password reset code: ${mailData.data.hash}. Valid for ${mailData.data.tokenExpires}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', { infer: true }),
        'src/modules/mail/mail-templates/reset-password.hbs',
      ),
      context: {
        title: resetPasswordTitle,
        hash: mailData.data.hash,
        tokenExpires: mailData.data.tokenExpires,
      },
    });
  }
  async confirmNewEmail(mailData: MailData<{ hash: string }>): Promise<void> {
    const emailConfirmTitle = 'Confirm your new email';
    const text1 = 'Please confirm your new email address.';
    const text2 = 'Click the link below to confirm your new email:';
    const text3 = 'If you did not request this, please ignore this email.';

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/confirm-new-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'modules',
        'mail',
        'mail-templates',
        'confirm-new-email.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });
  }
}
