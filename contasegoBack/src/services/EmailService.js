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
        <!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperação de Senha - ContaseGo</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; background-color: #f6f6f6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <!-- Logo com background -->
        <div style="text-align: center; margin-bottom: 30px; background-color: #1a237e; padding: 20px; border-radius: 8px;">
          <img src="https://piegotech.com/assets/img/logoContaseg.png" alt="ContaseGo" style="max-width: 200px; height: auto;">
        </div>
        
        <!-- Conteúdo Principal -->
        <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px; text-align: center;">
          Recuperação de Senha
        </h1>
        
        <p style="color: #666666; font-size: 16px; margin-bottom: 20px;">
          Olá <strong style="color: #333333;">${nome}</strong>,
        </p>
        
        <p style="color: #666666; font-size: 16px; margin-bottom: 20px;">
          Recebemos uma solicitação de recuperação de senha para sua conta. Sua nova senha temporária é:
        </p>
        
        <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 25px 0; text-align: center;">
          <code style="font-size: 24px; color: #333333; font-weight: bold;">${novaSenha}</code>
        </div>
        
        <div style="background-color: #fff8e1; padding: 15px; border-left: 4px solid #ffc107; margin: 25px 0;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>Importante:</strong> Por questões de segurança, você deverá alterar esta senha no seu próximo login.
          </p>
        </div>
        
        <p style="color: #dc3545; font-size: 14px; margin-top: 20px;">
          Se você não solicitou esta alteração, por favor entre em contato conosco imediatamente.
        </p>
        
        <!-- Botão de Ação -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/login" 
             style="background-color: #1a237e; 
                    color: #ffffff; 
                    text-decoration: none; 
                    padding: 12px 30px; 
                    border-radius: 5px; 
                    font-weight: bold;">
            Acessar Minha Conta
          </a>
        </div>
        
        <!-- Rodapé -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; text-align: center;">
          <p style="color: #999999; font-size: 12px;">
            Este é um e-mail automático. Por favor, não responda.
          </p>
          <p style="color: #999999; font-size: 12px;">
            &copy; 2024 ContaseGo - Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(email, nome, senha) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Bem-vindo ao ContaseGo',
      html: `
        <!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao ContaseGo</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; background-color: #f6f6f6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <!-- Logo com background -->
        <div style="text-align: center; margin-bottom: 30px; background-color: #1a237e; padding: 20px; border-radius: 8px;">
          <img src="https://piegotech.com/assets/img/logoContaseg.png" alt="ContaseGo" style="max-width: 200px; height: auto;">
        </div>
        
        <!-- Conteúdo Principal -->
        <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px; text-align: center;">
          Bem-vindo ao ContaseGo
        </h1>
        
        <p style="color: #666666; font-size: 16px; margin-bottom: 20px;">
          Olá <strong style="color: #333333;">${nome}</strong>,
        </p>
        
        <p style="color: #666666; font-size: 16px; margin-bottom: 20px;">
          Sua conta no ContaseGo foi criada com sucesso. Para acessar o sistema, utilize as seguintes credenciais:
        </p>
        
        <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 25px 0;">
          <p style="color: #666666; margin: 5px 0;">
            <strong>Email:</strong> ${email}
          </p>
          <p style="color: #666666; margin: 5px 0;">
            <strong>Senha:</strong> <code style="font-size: 18px; color: #333333; font-weight: bold;">${senha}</code>
          </p>
        </div>
        
        <div style="background-color: #fff8e1; padding: 15px; border-left: 4px solid #ffc107; margin: 25px 0;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>Importante:</strong> Por questões de segurança, você deverá alterar esta senha no seu primeiro acesso.
          </p>
        </div>
        
        <!-- Botão de Ação -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/login" 
             style="background-color: #1a237e; 
                    color: #ffffff; 
                    text-decoration: none; 
                    padding: 12px 30px; 
                    border-radius: 5px; 
                    font-weight: bold;">
            Acessar Minha Conta
          </a>
        </div>
        
        <!-- Rodapé -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; text-align: center;">
          <p style="color: #999999; font-size: 12px;">
            Este é um e-mail automático. Por favor, não responda.
          </p>
          <p style="color: #999999; font-size: 12px;">
            &copy; 2024 ContaseGo - Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = EmailService;