#!/usr/bin/env bash

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

psql postgres postgres -c "CREATE USER cso2_user WITH PASSWORD 'cso2';"
createdb -U postgres -O cso2_user cso2

psql cso2 cso2_user < $SCRIPTPATH/db/00_users.sql
psql cso2 cso2_user < $SCRIPTPATH/db/01_inventories.sql
psql cso2 cso2_user < $SCRIPTPATH/db/02_buymenues.sql
psql cso2 cso2_user < $SCRIPTPATH/db/03_cosmetics.sql
psql cso2 cso2_user < $SCRIPTPATH/db/04_loadouts.sql

# get inventoryitem oid
new_oid=$(psql cso2 postgres -c "SELECT oid FROM pg_type WHERE typname = 'inventoryitem';" | sed -n 3p | tr -d ' ')
echo "export const INVENTORY_ITEM_OID = $new_oid" > $SCRIPTPATH/users-service/src/config/inventory_item_oid.ts
