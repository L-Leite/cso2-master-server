export class SessionNetworkInfo {
    public ipAddress: string
    public clientPort: number
    public serverPort: number
    public tvPort: number

    constructor() {
        this.ipAddress = '0.0.0.0'
        this.clientPort = 0
        this.serverPort = 0
        this.tvPort = 0
    }
}
