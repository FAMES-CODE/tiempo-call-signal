import Firebird from "node-firebird";

const options: Firebird.Options = {
  host: process.env.FIREBIRD_HOST!,
  port: Number(process.env.FIREBIRD_PORT),
  database: process.env.FIREBIRD_DATABASE!,
  user: process.env.FIREBIRD_USER!,
  password: process.env.FIREBIRD_PASSWORD!,
  lowercase_keys: true,
};

export function withFirebird<T>(
  fn: (db: Firebird.Database) => Promise<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    Firebird.attach(options, async (err, db) => {
      if (err) return reject(err);
      try {
        const result = await fn(db);
        db.detach();
        resolve(result);
      } catch (e) {
        db.detach();
        reject(e);
      }
    });
  });
}


export function firebirdQuery<T = Record<string, unknown>>(
  query: string,
  params: unknown[] = [],
): Promise<T[]> {
  return withFirebird((db) => {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, result) => {
        if (err) return reject(err);
        resolve(result as T[]);
      });
    });
  });
}