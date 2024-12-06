const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendPasswordRecovery(email, nome, novaSenha) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Recuperação de Senha',
      html: `
        <h3>Recuperação de Senha</h3>
        <p>Olá ${nome},</p>
        <p>Sua nova senha é: <strong>${novaSenha}</strong></p>
        <p>Por segurança, você deverá alterar esta senha no seu próximo login.</p>
        <p>Se você não solicitou esta alteração, entre em contato conosco imediatamente.</p>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = EmailService;
