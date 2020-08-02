#!/bin/sh
#
# this script sets up the cso2 master server services
# it downloads or builds the required files and installs the required npm dependencies
# pass --build-services as an argument to the script to build the services yourself
#

set -e

SHOULD_BUILD_SERVICES=0

get_latest_build_tag() {
    git describe --tags "$(git rev-list --tags --max-count=1)"
}

fetch_service_build_url() {
    FETCH_REPO_OWNER=$1
    FETCH_REPO_NAME=$2
    FETCH_BUILD_TAG=$3

    curl -Ls "https://api.github.com/repos/$FETCH_REPO_OWNER/$FETCH_REPO_NAME/releases/tags/$FETCH_BUILD_TAG" |
        grep "browser_download_url" |
        cut -d '\:' -f 2,3 |
        tr -d "\"\ "
}

download_latest_service_build() {
    SERVICE_NAME=$1
    SERVICE_OWNER=$2

    LAST_TAG=$(get_latest_build_tag)
    BUILD_URL=$(fetch_service_build_url "$SERVICE_OWNER" "$SERVICE_NAME" "$LAST_TAG")
    echo "Downloading $BUILD_URL"

    curl -L "$BUILD_URL" | tar -xz
}

handle_submodule() {
    SUBMODULE_NAME=$1
    SUBMODULE_DIR=$2

    cd ./"${SUBMODULE_DIR}"
    if [ $SHOULD_BUILD_SERVICES = 0 ]; then
        echo "Fetching ${SUBMODULE_NAME}"
        download_latest_service_build "$SUBMODULE_NAME" L-Leite
        npm i --only=production
    elif [ $SHOULD_BUILD_SERVICES = 1 ]; then
        echo "Building ${SUBMODULE_NAME}"
        npm i
        npx gulp build
    fi
    cd ../
}

for i in "$@"; do
    if [ "$i" = "--build-services" ]; then
        SHOULD_BUILD_SERVICES=1
        echo "The user selected to build services..."
    fi
done

if [ $SHOULD_BUILD_SERVICES = 0 ]; then
    echo "The user selected to download services prebuilds..."
fi

handle_submodule cso2-master-server master-server
handle_submodule cso2-users-service users-service
handle_submodule cso2-inventory-service inventory-service
handle_submodule cso2-webapp webapp
