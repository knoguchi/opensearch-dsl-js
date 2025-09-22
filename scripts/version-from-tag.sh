#!/bin/bash

# Script to set package.json version from latest git tag

set -e

# Get the latest tag
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

if [ -z "$LATEST_TAG" ]; then
    echo "No git tags found. Please create a tag first:"
    echo "  git tag v0.1.1"
    echo "  git push origin v0.1.1"
    exit 1
fi

# Remove 'v' prefix if present
VERSION=${LATEST_TAG#v}

echo "Latest git tag: $LATEST_TAG"
echo "Setting package version to: $VERSION"

# Update package.json version without creating git tag
npm version "$VERSION" --no-git-tag-version

echo "Package version updated to $VERSION"
echo "Current package.json version: $(node -p "require('./package.json').version")"