#!/usr/bin/env bash

# init db
createdb cso2
psql cso2 < ./config/db/users.sql
psql cso2 < ./config/db/inventories.sql
psql cso2 < ./config/db/inventory/buymenues.sql
psql cso2 < ./config/db/inventory/cosmetics.sql
psql cso2 < ./config/db/inventory/loadouts.sql
new_oid=$(psql cso2 -c "SELECT oid FROM pg_type WHERE typname = 'inventoryitem';" | sed -n 3p | tr -d ' ')
echo "export const INVENTORY_ITEM_OID = $new_oid" > ./src/config/inventory_item_oid.ts

# use the CI database user
sed -i -e "s/username: 'cso2_user'/username: 'postgres'/g" ./src/config/db.ts
sed -i -e "s/password: 'cso2'/password: 'Password12!'/g" ./src/config/db.ts

# transpile source code
npx gulp build