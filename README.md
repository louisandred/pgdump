# 🛠️ pgdump

[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
[![npm version](https://img.shields.io/npm/v/@louisbm/pgdump?style=flat)](https://www.npmjs.com/package/@louisbm/pgdump)
[![License](https://img.shields.io/npm/l/@louisbm/pgdump?style=flat)](LICENSE)

Lightweight Node.js wrapper for PostgreSQL `pg_dump`.

---

## 🚀 Features

- Simple Node.js wrapper for PostgreSQL `pg_dump`
- Works on all major platforms (Linux, macOS, Windows)
- Dump database in a file or capture as string
- Supports standard authentication options
- Easily configurable with additional `pg_dump` CLI options

---

## 💿 Installation

```bash
# Using npm
npm i @louisbm/pgdump
```

```bash
# Using yarn
yarn add @louisbm/pgdump
```

```bash
# Using pnpm
pnpm add @louisbm/pgdump
```

---

## ⚙️ Usage

### Basic Example

#### Dump in a file
```ts
import { dumpSchema } from '@louisbm/pgdump';

const backupDatabase = async () => {
  try {
    await dumpSchema({
      host: 'localhost',
      port: 5432,
      database: 'mydb',
      user: 'postgres',
	  outputFile: './database_dump.sql'
    });
  } catch (err) {
    console.error('Error creating database dump:', err);
  }
}

backupDatabase();
```

#### Capture the string
```ts
import { dumpSchema } from '@louisbm/pgdump';

const backupDatabase = async () => {
  try {
    const sql = await dumpSchema({
      host: 'localhost',
      port: 5432,
      database: 'mydb',
      user: 'postgres',
    });

    console.log('Database dump captured successfully:');
    console.log(sql);
  } catch (err) {
    console.error('Error creating database dump:', err);
  }
}

backupDatabase();
```

---

## ⚡ CLI Usage

`@louisbm/pgdump` can also be used directly from the command line.

### Install globally (optional)

```bash
npm i -g @louisbm/pgdump
```

#### Basic command

```bash
pgdump --host 'localhost' --port 5432 --database 'mydb' --user 'postgres' --file './database_dump.sql'
```

---

## 📚 Contributing

Contributions, issues, and feature requests are welcomed !  

To contribute:

1. Fork the repository 
2. Create a new branch for your feature or fix
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).





