import { LogInstance } from 'log/loginstance'

/**
 * writes logged data from morgan to a winston logger instance
 * @class MorganToWinstonStream
 */
export class MorganToWinstonStream {
    /**
     * Output stream for writing log lines.
     */
    public write(str: string): void {
        LogInstance.info(str)
    }
}
