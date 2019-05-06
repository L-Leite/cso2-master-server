export class UserCosmetics {
    public ctItem: number
    public terItem: number
    public headItem: number
    public gloveItem: number
    public backItem: number
    public stepsItem: number
    public cardItem: number
    public sprayItem: number

    constructor(ctItem: number, terItem: number, headItem: number, gloveItem: number,
                backItem: number, stepsItem: number, cardItem: number, sprayItem: number) {
        this.ctItem = ctItem
        this.terItem = terItem
        this.headItem = headItem
        this.gloveItem = gloveItem
        this.backItem = backItem
        this.stepsItem = stepsItem
        this.cardItem = cardItem
        this.sprayItem = sprayItem
    }
}
