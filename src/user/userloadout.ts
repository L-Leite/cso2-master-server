export class UserLoadout {
    public loadout_num: number
    public primary_weapon: number
    public secondary_weapon: number
    public melee: number
    public hegrenade: number
    public flash: number
    public smoke: number

    constructor(
        loadoutNum: number,
        primary: number,
        secondary: number,
        melee: number,
        hegrenade: number,
        flash: number,
        smoke: number
    ) {
        this.loadout_num = loadoutNum
        this.primary_weapon = primary
        this.secondary_weapon = secondary
        this.melee = melee
        this.hegrenade = hegrenade
        this.flash = flash
        this.smoke = smoke
    }
}
