/**
 * represents an user account
 */
export class User {
  public userId: number;
  public userName: string;
  public playerName: string;

  public gm: boolean;

  public points: number;
  public cash: number;
  public mpoints: number;

  public level: number;
  public curExp: number;
  public maxExp: number;
  public vipLevel: number;
  public vipXp: number;

  public rank: number;
  public rankFrame: number;

  public playedMatches: number;
  public wins: number;
  public secondsPlayed: number;

  public kills: number;
  public deaths: number;
  public assists: number;
  public headshots: number;
  public accuracy: number;

  public avatar: number;
  public unlockedAvatars: number[];

  public netCafeName: string;

  public clanName: string;
  public clanMark: number;

  public worldRank: number;

  public titleId: number;
  public unlockedTitles: number[];
  public signature: string;

  public bestGamemode: number;
  public bestMap: number;

  public unlockedAchievements: number[];

  public skillHumanCurXp: BigInt;
  public skillHumanMaxXp: BigInt;
  public skillHumanPoints: number;
  public skillZombieCurXp: BigInt;
  public skillZombieMaxXp: BigInt;
  public skillZombiePoints: number;

  /**
   * is the user a VIP?
   * @returns true if so, false if not
   */
  public isVip(): boolean {
    return this.vipLevel !== 0;
  }
}
