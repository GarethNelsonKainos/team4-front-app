#!/usr/bin/env bash
set -euo pipefail

ACR_NAME=${ACR_NAME:-academyacrj3r5dv}
ACR_LOGIN_SERVER=${ACR_LOGIN_SERVER:-${ACR_NAME}.azurecr.io}
IMAGE_REPOSITORY=${IMAGE_REPOSITORY:-team4-front-app-cameron}
PLATFORM=${PLATFORM:-linux/amd64}

TAG_LATEST=${TAG_LATEST:-latest}
TAG_DEV=${TAG_DEV:-dev}
TAG_SHA=${TAG_SHA:-sha-$(git rev-parse --short HEAD)}

az acr login --name "$ACR_NAME"

docker buildx build \
  --platform "$PLATFORM" \
  -t "${ACR_LOGIN_SERVER}/${IMAGE_REPOSITORY}:${TAG_LATEST}" \
  -t "${ACR_LOGIN_SERVER}/${IMAGE_REPOSITORY}:${TAG_DEV}" \
  -t "${ACR_LOGIN_SERVER}/${IMAGE_REPOSITORY}:${TAG_SHA}" \
  --push .

echo "Pushed tags: ${TAG_LATEST}, ${TAG_DEV}, ${TAG_SHA}"
