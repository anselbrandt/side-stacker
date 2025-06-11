#!/bin/bash
set -euo pipefail

PEM_KEY="us-east-1-macbook-air.pem"
REMOTE="ubuntu@ec2-44-203-125-172.compute-1.amazonaws.com"
REMOTE_DIR="/home/ubuntu/backend"

# Sync code except exclusions
rsync -az --delete \
  --exclude='__pycache__' \
  --exclude='.venv' \
  --exclude='.git' \
  -e "ssh -i ${PEM_KEY}" \
  ./ "${REMOTE}:${REMOTE_DIR}/"

# Prune docker
ssh -i "${PEM_KEY}" "${REMOTE}" 'docker system prune -a --volumes -f'

# Docker compose down
ssh -i "${PEM_KEY}" "${REMOTE}" "docker compose -f ${REMOTE_DIR}/compose.yaml down || true"

# Remove old image
ssh -i "${PEM_KEY}" "${REMOTE}" "docker rmi backend:latest || true"

# Build docker image
ssh -i "${PEM_KEY}" "${REMOTE}" "cd ${REMOTE_DIR} && docker build -t backend:latest ."

# Docker compose up
ssh -i "${PEM_KEY}" "${REMOTE}" "cd ${REMOTE_DIR} && docker compose -f compose.yaml up -d"