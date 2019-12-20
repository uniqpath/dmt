const { Pool } = require('pg');

class DbAccess {
  constructor(creds) {
    const poolOpts = { max: 30, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000 };
    this.pool = new Pool(Object.assign(creds, poolOpts));
  }

  lookup({ table, indexColumn, indexValue }) {
    const sql = `SELECT * FROM ${table} WHERE ${indexColumn} = $1`;
    const query = {
      text: sql,
      rowMode: 'array'
    };

    return new Promise((success, reject) => {
      this.pool.query(query, [indexValue]).then(res => {
        success(res.rows);
      });
    });
  }
}

module.exports = DbAccess;
