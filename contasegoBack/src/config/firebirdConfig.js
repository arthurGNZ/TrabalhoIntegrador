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

const pool = Firebird.pool(5, firebirdOptions); // 5 conexões no pool

const getFirebirdConnection = () => {
  return new Promise((resolve, reject) => {
    pool.get((err, db) => {
      if (err) {
        console.error('Erro ao obter conexão do pool:', err);
        reject(err);
        return;
      }

      // Wrapper para garantir que detach seja chamado
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
          return new Promise((resolve) => {
            pool.destroy(db);
            resolve();
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

module.exports = { getFirebirdConnection, testFirebirdConnection };
