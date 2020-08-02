param (
    [switch]$buildServices = $false
)

function get_latest_build_tag() {
    git describe --tags $(git rev-list --tags --max-count=1)
}

function fetch_service_build_url() {
    param( [string]$FetchRepoOwner, [string]$FetchRepoName, [string]$FetchBuildTag )

    $buildData = Invoke-Webrequest "https://api.github.com/repos/$FetchRepoOwner/$FetchRepoName/releases/tags/$FetchBuildTag" | ConvertFrom-Json
    return $buildData.assets[0].browser_download_url
}

function download_latest_service_build() {
    param( [string]$serviceOwner, [string]$serviceName )

    $latestTag = $(get_latest_build_tag)
    $buildUrl = $(fetch_service_build_url $serviceOwner $serviceName $latestTag)

    Write-Host "Downloading $buildUrl"

    $buildArchiveName = "build.tar.gz"

    Invoke-Webrequest $buildUrl -OutFile $buildArchiveName
    tar -xzf $buildArchiveName
    Remove-Item $buildArchiveName
}

function handle_submodule() {
    param( [string]$submoduleName, [string]$submodulePath )

    Push-Location $submodulePath

    if ($buildServices -eq $true) {
        Write-Host "Building service L-Leite/$submoduleName"
        npm i
        npx gulp build
    }
    else {
        Write-Host "Fetching service L-Leite/$submoduleName"
        download_latest_service_build L-Leite $submoduleName
        npm i --only=production
    }

    Pop-Location
}

if ($buildServices -eq $true) {
    Write-Host "The user selected to build services..."
}
else {
    Write-Host "The user selected to download services prebuilds..."
}

handle_submodule "cso2-master-server" "master-server"
handle_submodule "cso2-users-service" "users-service"
handle_submodule "cso2-inventory-service" "inventory-service"
handle_submodule "cso2-webapp" "webapp"

if ($buildServices -eq $true) {
    Write-Host "Built services successfully"
}
else {
    Write-Host "Fetched services successfully"
}
