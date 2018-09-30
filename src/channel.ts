/**
 * stores a channel's info
 * @class Channel
 */
export class Channel {
    public id: number
    public name: string

    constructor(id: number, name: string) {
        this.id = id
        this.name = name
    }
}
