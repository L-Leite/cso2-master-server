import postgres from 'postgres'

import { LogInstance } from 'log/loginstance'

import { InventoryItem } from 'entities/inventory/item'
import { INVENTORY_ITEM_OID } from './inventory_item_oid'

export type DB_POSTGRES_CUSTOM_TYPES = {
    inventoryItem: InventoryItem
}
export const DB_POSTGRES_CONFIG: postgres.Options<DB_POSTGRES_CUSTOM_TYPES> = {
    host: 'localhost',
    port: 5432,
    database: 'cso2',
    username: 'cso2_user',
    password: 'cso2',
    onnotice: (notice: postgres.Notice) => {
        LogInstance.debug(notice.field)
    },
    types: {
        inventoryItem: {
            to: INVENTORY_ITEM_OID,
            from: [INVENTORY_ITEM_OID],
            parse: (str: string): InventoryItem => {
                str = str.substr(1, str.length - 2)
                const parts = str.split(',')

                const id = Number(parts[0])
                const ammount = Number(parts[1])

                return new InventoryItem(id, ammount)
            },
            serialize: (item: InventoryItem): number[] => {
                return [item.item_id, item.ammount]
            }
        }
    },
    connection: {
        // eslint-disable-next-line camelcase
        application_name: 'cso2-users-service'
    }
}

export const DB_POSTGRES_END_TIMEOUT = 5
