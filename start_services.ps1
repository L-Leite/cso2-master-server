#
# this script starts the cso2 master server services
# you must manually close the services
# you can customize the variables below
#

# customizable variables start

# defines the environment where the services are running
# can be 'development' or 'production'
$env:NODE_ENV = 'development'

# mongodb database connection information
$env:DB_HOST = '127.0.0.1'
$env:DB_PORT = '27017'
$env:DB_NAME = 'cso2'

# the ports which the services will listen to
$env:USERS_PORT = '30100'
$env:INVENTORY_PORT = '30101'
$env:WEBAPP_PORT = '8080'

# information used by the master server
# tells it where the user and inventory services are
$env:USERSERVICE_HOST = '127.0.0.1'
$env:USERSERVICE_PORT = $env:USERS_PORT
$env:INVSERVICE_HOST = '127.0.0.1'
$env:INVSERVICE_PORT = $env:INVENTORY_PORT

# customizable variables end

$jobs = [System.Collections.ArrayList]@()

Set-Location .\users-service
$jobs.Add($(Start-Process -FilePath 'node' -ArgumentList './dist/service.js'))
Set-Location ..\

Set-Location .\inventory-service
$jobs.Add($(Start-Process -FilePath 'node' -ArgumentList './dist/service.js'))
Set-Location ..\

# give some time for the services to startup
Start-Sleep -s 5

Set-Location .\master-server
$jobs.Add($(Start-Process -FilePath 'node' -ArgumentList './dist/server.js'))
Set-Location ..\

Set-Location .\webapp
$jobs.Add($(Start-Process -FilePath 'node' -ArgumentList './dist/app.js'))
Set-Location ..\
