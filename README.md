# FastAPI Vite React

### Run

#### Backend

```
cd backend && uv sync

&&

uv run task dev

or

uv run uvicorn main:app --reload
```

#### Frontend

```
cd frontend && pnpm install

&&

pnpm run dev
```

### Notes

Vite is currently configured to `vite build --watch` to `<root>/dist`, allowing FastAPI to serve the dist folder. To use the Vite dev server, remove the `--watch` option in the `package.json` `dev` script.

To run the backend and frontend with https on a local domain, but from different subpaths, add the following (requires disabling `build --watch`):

**backend ROUTE_PATH and frontend VITE_API_BASEPATH must match**

`backend/.env`

```
ROOT_PATH="/api"
HOST="https://sub.domain.tld"
```

`frontend/.env`

```
VITE_BASEPATH="/app"
VITE_HOSTNAME="sub.domain.tld"
VITE_API_BASEPATH="/api"
```
