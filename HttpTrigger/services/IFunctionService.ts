export interface IFunctionService<T> {
    processMessageAsync(message: T): Promise<object>;
}
