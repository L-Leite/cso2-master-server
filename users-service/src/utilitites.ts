export function SetupSetParams<T>(params: T): (keyof T)[] {
    return Object.keys(params) as (keyof T)[]
}
