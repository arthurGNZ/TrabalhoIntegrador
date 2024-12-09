const app = require('./app');
const { testFirebirdConnection } = require('./config/firebirdConfig');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await testFirebirdConnection();
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();
