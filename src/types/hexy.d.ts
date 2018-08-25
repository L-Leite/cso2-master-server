declare module 'hexy' {
    export function hexy(buffer: Buffer, config?: {
        width?: number,
        numbering?: string, format?: string, caps?: string, prefix?: string,
        indent?: number, html?: boolean, offset?: number, length?: number,
        display_offset?: number
    }): string
}
