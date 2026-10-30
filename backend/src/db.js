// ============================================================
//  db.js — доступ к PostgreSQL через системный клиент psql.
//
//  В этом окружении недоступна установка npm-пакетов (нет сетевого
//  доступа к реестру), поэтому вместо драйвера `pg` мы используем
//  уже установленный в системе клиент `psql` через child_process.
//  Параметры запросов передаются через `psql -v name=value` и
//  подставляются в SQL как `:'name'` — psql сам экранирует значение
//  как строковый литерал, что исключает SQL-инъекции (значения
//  никогда не попадают в текст команды оболочки — они передаются
//  через argv, а не интерполируются вручную).
//
//  Каждый запрос оборачивается в
//    SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (...) t;
//  что даёт результат одной строкой валидного JSON, который легко
//  разобрать в JS без парсинга табличного вывода psql.
// ============================================================

'use strict';

const { spawnSync } = require('child_process');

const PG_HOST = process.env.PGHOST || 'localhost';
const PG_PORT = process.env.PGPORT || '5432';
const PG_USER = process.env.PGUSER || 'postgres';
const PG_PASSWORD = process.env.PGPASSWORD || 'postgres';
const PG_DATABASE = process.env.PGDATABASE || 'airline';

/**
 * Тег-функция для шаблонных строк: sql`SELECT * FROM flights WHERE id = ${id}`
 * Возвращает { text, binds } — текст с плейсхолдерами :'p0', :'p1', ... и
 * карту значений для psql -v. null/undefined подставляются как литерал NULL
 * прямо в текст (без риска, так как это не пользовательские данные).
 */
function sql(strings, ...values) {
  let text = strings[0];
  const binds = {};
  values.forEach((v, i) => {
    if (v === null || v === undefined) {
      text += 'NULL';
    } else if (typeof v === 'number' && Number.isFinite(v)) {
      const name = 'p' + i;
      binds[name] = String(v);
      text += `:'${name}'`;
    } else if (typeof v === 'boolean') {
      const name = 'p' + i;
      binds[name] = v ? 'true' : 'false';
      text += `:'${name}'`;
    } else {
      const name = 'p' + i;
      binds[name] = String(v);
      text += `:'${name}'`;
    }
    text += strings[i + 1];
  });
  return { text, binds };
}

/** Низкоуровневый вызов psql. Возвращает { stdout, stderr, status }. */
function runPsql(sqlText, binds) {
  const args = [
    '-h', PG_HOST, '-p', String(PG_PORT), '-U', PG_USER, '-d', PG_DATABASE,
    '-v', 'ON_ERROR_STOP=1', '-t', '-A', '-q', '--no-psqlrc',
  ];
  for (const [name, value] of Object.entries(binds || {})) {
    args.push('-v', `${name}=${value}`);
  }
  const result = spawnSync('psql', args, {
    input: sqlText,
    encoding: 'utf8',
    env: Object.assign({}, process.env, { PGPASSWORD: PG_PASSWORD }),
    maxBuffer: 1024 * 1024 * 32,
  });
  if (result.error) {
    throw new Error('Не удалось запустить psql: ' + result.error.message);
  }
  if (result.status !== 0) {
    throw new Error('Ошибка PostgreSQL: ' + (result.stderr || '').trim());
  }
  return result.stdout;
}

/** Выполняет SELECT-подобный запрос и возвращает массив строк (объектов). */
function rows({ text, binds }) {
  const wrapped = `SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (\n${text}\n) t;`;
  const out = runPsql(wrapped, binds).trim();
  if (!out) return [];
  return JSON.parse(out);
}

/** Выполняет один ряд (SELECT ... LIMIT 1-подобный) — удобный хелпер. */
function one(tagged) {
  const list = rows(tagged);
  return list.length ? list[0] : null;
}

/**
 * Выполняет DML-запрос (INSERT/UPDATE/DELETE) с RETURNING и возвращает
 * вставленные/изменённые строки как массив объектов.
 */
function execReturning({ text, binds }) {
  const wrapped = `WITH t AS (\n${text}\n) SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM t;`;
  const out = runPsql(wrapped, binds).trim();
  if (!out) return [];
  return JSON.parse(out);
}

/** Выполняет DML-запрос без возврата строк. */
function exec({ text, binds }) {
  runPsql(text + ';', binds);
}

module.exports = { sql, rows, one, execReturning, exec };
