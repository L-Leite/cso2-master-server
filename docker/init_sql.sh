#!/bin/sh

# init db
createdb cso2
psql cso2 < /sql/users.sql
psql cso2 < /sql/inventories.sql
psql cso2 < /sql/inventory/buymenues.sql
psql cso2 < /sql/inventory/cosmetics.sql
psql cso2 < /sql/inventory/loadouts.sql

# get inventoryitem oid
new_oid=$(psql cso2 -c "SELECT oid FROM pg_type WHERE typname = 'inventoryitem';" | sed -n 3p | tr -d ' ')
echo "export const INVENTORY_ITEM_OID = $new_oid" > /gensrc/config/inventory_item_oid.ts
