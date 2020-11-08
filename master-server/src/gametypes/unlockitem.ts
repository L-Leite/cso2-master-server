export enum UnlockCurrency {
    Points = 0,
    Mileage = 1
}

export interface UnlockItem {
    itemId: number
    currency: UnlockCurrency
    price: number
}

export interface UnlockProgress {
    targetItemId: number // current weapon itemid
    parentItemId: number // previous weapon itemid
    kills: number // current weapon killnum
}
