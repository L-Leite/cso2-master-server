export class UserLoadout {
    public loadoutNum: number
    public primary: number
    public secondary: number
    public melee: number
    public hegrenade: number
    public flash: number
    public smoke: number

    constructor(loadoutNum: number, primary: number, secondary: number, melee: number,
                hegrenade: number, flash: number, smoke: number) {
        this.loadoutNum = loadoutNum
        this.primary = primary
        this.secondary = secondary
        this.melee = melee
        this.hegrenade = hegrenade
        this.flash = flash
        this.smoke = smoke
    }
}
