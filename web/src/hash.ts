import crypto from 'crypto'
import pify from 'pify'

export const HASH_PASSWORD_VERSION = 1

const DEFAULT_HASH_ITERATIONS = 100000
const DEFAULT_KEY_LENGTH = 64
const DEFAULT_COMPONENT_COUNT = 4

/**
 * hashes a password with PBKDF2
 * @param password the password to be hashed
 * @param iterations the number of iterations to perform
 * @param salt the hash's salt
 * @returns a string with a string format version, salt, iterations and hash respectively
 */
async function generatePasswordHash(
    password: string,
    iterations: number,
    salt: string,
    keylen: number
): Promise<Buffer> {
    return (await pify(crypto.pbkdf2)(
        password,
        salt,
        iterations,
        keylen,
        'sha512'
    )) as Buffer
}

/**
 * stores and manages password hashes
 */
export class HashContainer {
    /**
     * creates a new composed hash from a password and returns a new container object
     * @param password the password to be hashed
     * @returns a new hash container object based on the input password
     */
    public static async create(
        password: string,
        iterations: number = DEFAULT_HASH_ITERATIONS,
        salt: string = null,
        keylen: number = DEFAULT_KEY_LENGTH
    ): Promise<HashContainer> {
        if (salt == null) {
            salt = crypto.randomBytes(16).toString('hex')
        }

        const hash: Buffer = await generatePasswordHash(
            password,
            iterations,
            salt,
            keylen
        )

        return new HashContainer(salt, iterations, hash)
    }

    /**
     * parses a composed hash and returns a new hash container object
     * @param composedHash the composed hash to be parsed
     * @returns a new hash container object with the parsed composed hash
     */
    public static from(composedHash: string): HashContainer {
        const hashComponents: string[] = composedHash.split(':')

        if (hashComponents.length !== DEFAULT_COMPONENT_COUNT) {
            throw new Error(
                `The target's hash length ${hashComponents.length} is invalid`
            )
        }

        const passwordVersion = Number(hashComponents[0])

        if (passwordVersion !== HASH_PASSWORD_VERSION) {
            throw new Error(
                `The target's hash version ${passwordVersion} is different from ours ${HASH_PASSWORD_VERSION}`
            )
        }

        const salt: string = hashComponents[1]
        const iterations = Number(hashComponents[2])
        const hash: Buffer = Buffer.from(hashComponents[3], 'hex')

        return new HashContainer(salt, iterations, hash)
    }

    private salt: string
    private iterations: number
    private hash: Buffer

    protected constructor(salt: string, iterations: number, hash: Buffer) {
        this.salt = salt
        this.iterations = iterations
        this.hash = hash
    }

    /**
     * compare this hash container with another hash container
     * @param right the other hash container to compare to
     * @returns true if they're equal, false if not
     */
    public compare(right: HashContainer): boolean {
        if (this.salt !== right.salt || this.iterations !== right.iterations) {
            return false
        }

        return crypto.timingSafeEqual(this.hash, right.hash)
    }

    /**
     * clone a hash's container salt and iterations and use them to hash a different password
     * @param password to be hashed
     * @returns a new hash container object with the new hash and the cloned salt and iterations
     */
    public async cloneSettings(password: string): Promise<HashContainer> {
        return await HashContainer.create(password, this.iterations, this.salt)
    }

    /**
     * outputs the hash in the following format:
     * {version number}:{salt}:{iterations}:{hash}
     * @returns the combined hash
     */
    public build(): string {
        return `${HASH_PASSWORD_VERSION}:${this.salt}:${
            this.iterations
        }:${this.hash.toString('hex')}`
    }
}
