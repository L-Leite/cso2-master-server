#!/usr/bin/env bash

# setup env vars for the package file's name
export GIT_COMMIT_HASH=$(git rev-parse --short=8 HEAD)
export GIT_BRANCH=${APPVEYOR_PULL_REQUEST_HEAD_REPO_BRANCH:-$APPVEYOR_REPO_BRANCH}  

# from https://gist.github.com/yvele/e98e3a155335a6e00e71#gistcomment-2935280
export SERVICE_VERSION=$(grep '"version":' package.json -m1 | cut -d\" -f4)

export FILENAME_SUFFIX="$SERVICE_VERSION-$GIT_COMMIT_HASH-$GIT_BRANCH"

# package the transpiled source code
tar -zcf "cso2-users-service_$FILENAME_SUFFIX.tar.gz" dist package.json yarn.lock COPYING README.md