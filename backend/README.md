# FastAPI

### Local build and deployment to EC2

1. Ensure .pem file exists in backend/
2. Modify username and EC2 location in pyproject.toml

```
uv run task docker_deploy
```

#### On EC2

```
docker compose up -d
```

### Docker

```
docker compose up -d --build
```

### Install

```
uv sync
```

### Run

```
uv run task dev

or

uv run uvicorn main:app --reload
```

### Tests

```
uv run task test

or

uv run pytest
```
