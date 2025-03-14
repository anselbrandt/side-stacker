FROM node:22.14.0-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm
COPY /frontend /app/frontend
WORKDIR /app/frontend

RUN pnpm install
RUN pnpm run build

FROM python:3.12.9-slim

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

COPY /backend /app/backend
COPY --from=build /app/dist /app/dist

WORKDIR /app/backend
RUN uv sync --frozen --no-cache

ENV ENV_MODE="PROD"
CMD [".venv/bin/uvicorn", "app.main:app","--port", "8000", "--host", "0.0.0.0"]