import fs from 'fs'
import pify from 'pify'

/**
 * stores the list of images inside public/images
 */
export class MapImageList {
  /**
   * builds the image list
   */
  public static async build(): Promise<void> {
    this.files = (await pify(fs.readdir)(
      'public/images/backgrounds'
    )) as string[]
  }

  /**
   * get a random file from the list
   * @returns the random file, or null if a bad index was generated
   */
  public static getRandomFile(): string {
    const index: number = Math.floor(Math.random() * this.files.length)

    if (index < 0 || index >= this.files.length) {
      return null
    }

    return this.files[index]
  }

  public static getNumOfFiles(): number {
    return this.files.length
  }

  private static files: string[] = []
}
