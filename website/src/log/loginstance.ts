import winston from 'winston'

/**
 * sets up and stores the winston logger
 */
export class LogInstance {
    /**
     * log a debug type message
     * @param message the message to log
     */
    public static debug(message: string): void {
        LogInstance.logger.debug(message)
    }

    /**
     * log a error type message
     * @param message the message to log
     */
    public static error(message: string): void {
        LogInstance.logger.error(message)
    }

    /**
     * log a information type message
     * @param message the message to log
     */
    public static info(message: string): void {
        LogInstance.logger.info(message)
    }

    /**
     * log a warning type message
     * @param message the message to log
     */
    public static warn(message: string): void {
        LogInstance.logger.warn(message)
    }

    /**
     * setup winston logger
     */
    public static init(): void {
        LogInstance.logger = winston.createLogger({
            format: winston.format.json(),
            level: 'info',
            transports: [
                new winston.transports.File({
                    filename: 'error.log',
                    level: 'error'
                }),
                new winston.transports.File({ filename: 'combined.log' })
            ]
        })

        if (process.env.NODE_ENV === 'development') {
            LogInstance.logger.add(
                new winston.transports.Console({
                    format: winston.format.simple(),
                    level: 'debug'
                })
            )
        }
    }
    private static logger: winston.Logger
}

// init the logger
LogInstance.init()
