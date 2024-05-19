# zCredStore

## Development

### Requirements

- [Node.js](https://nodejs.org)
- [pnpm](https://pnpm.io)
- [Docker](https://www.docker.com)

### Setup & Run dev environment

Install dependencies:
```bash
pnpm i
```
Run database Docker container:
```bash
pnpm dev:db:up
```
Database data will be stored in `./dev/db-dev-data` directory.

Create database schema:
```bash
pnpm drizzle:push
```

Run server:
```bash
pnpm dev
```

### Run tests

Testing requires a running Docker daemon.

Run tests:
```bash
pnpm test
```

Run tests with coverage:
```bash
pnpm test:coverage
```

Run tests in watch mode:
```bash
pnpm test:watch
```
