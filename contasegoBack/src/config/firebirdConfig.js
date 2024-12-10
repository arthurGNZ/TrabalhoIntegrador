const Firebird = require('node-firebird');

const firebirdOptions = {
  host: process.env.FIREBIRD_HOST,
  port: process.env.FIREBIRD_PORT,
  database: process.env.FIREBIRD_DATABASE,
  user: process.env.FIREBIRD_USER,
  password: process.env.FIREBIRD_PASSWORD,
  lowercase_keys: false,
  retryConnectionInterval: 1000
};

const pool = Firebird.pool(5, firebirdOptions); 

const getFirebirdConnection = (timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout ao obter conexão do pool'));
    }, timeout);

    pool.get((err, db) => {
      clearTimeout(timeoutId); 
      if (err) {
        console.error('Erro ao obter conexão do pool:', err);
        reject(err);
        return;
      }

      const wrappedDb = {
        query: (sql, params) => {
          return new Promise((resolve, reject) => {
            db.query(sql, params, (err, result) => {
              if (err) {
                console.error('Erro na query:', err);
                reject(err);
              } else {
                resolve(result);
              }
            });
          });
        },
        detach: () => {
          return new Promise((resolve, reject) => {
            db.detach((err) => {
              if (err) {
                console.error('Erro ao liberar conexão:', err);
                reject(err);
              } else {
                resolve();
              }
            });
          });
        }
      };

      resolve(wrappedDb);
    });
  });
};

const testFirebirdConnection = async () => {
  try {
    const db = await getFirebirdConnection();
    console.log('Conexão Firebird testada com sucesso');
    await db.detach();
  } catch (error) {
    console.error('Erro ao testar conexão Firebird:', error);
    throw error;
  }
};

const closePool = () => {
  return new Promise((resolve, reject) => {
    pool.destroyAllNow((err) => {
      if (err) {
        console.error('Erro ao destruir todas as conexões no pool:', err);
        reject(err);
      } else {
        console.log('Todas as conexões no pool foram destruídas');
        resolve();
      }
    });
  });
};

module.exports = { getFirebirdConnection, testFirebirdConnection, closePool };
