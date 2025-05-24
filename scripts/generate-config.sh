#!/bin/bash

# * chmod +x scripts/generate-config.sh
# * ./scripts/generate-config.sh

export $(grep -v '^#' .env | xargs)

echo "Generating livekit.yaml from template..."
envsubst < livekit.yaml.template > livekit.yaml

echo "Generating turnserver.conf from template..."
envsubst < turnserver.conf.template > turnserver.conf

echo "Done."
