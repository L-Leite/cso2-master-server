export enum ShopCurrency {
    Credits = 0,
    Points = 1,
    Mileage = 2
}

export enum ShopItemFlags {
    Event = 0x1,
    New = 0x2,
    Hot = 0x4,
    Unknown = 0x8,
    Sale = 0x10,
    Giftable = 0x20
}

export interface ShopPaymentOption {
    quantity: number
    previousPrice: number
    price: number
    discountPercent: number
    mileageReward: number
    flags: ShopItemFlags
}

export interface ShopItem {
    itemId: number
    payCurrency: ShopCurrency
    payOptions: ShopPaymentOption[]
}
