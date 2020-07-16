export class UserCosmetics {
    public ct_item: number
    public ter_item: number
    public head_item: number
    public glove_item: number
    public back_item: number
    public steps_item: number
    public card_item: number
    public spray_item: number

    constructor(
        ctItem: number,
        terItem: number,
        headItem: number,
        gloveItem: number,
        backItem: number,
        stepsItem: number,
        cardItem: number,
        sprayItem: number
    ) {
        this.ct_item = ctItem
        this.ter_item = terItem
        this.head_item = headItem
        this.glove_item = gloveItem
        this.back_item = backItem
        this.steps_item = stepsItem
        this.card_item = cardItem
        this.spray_item = sprayItem
    }
}
