export enum ToolExecutionType {
    /**
     * @description Executed on every supported PHP version with lowest & latest dependencies.
     *              In case, a lock-file is present, the minimum supported PHP version will also run with LOCKED
     *              dependencies.
     */
    MATRIX = 'matrix',

    /**
     * @description Executed on the minimum PHP version with either LOCKED or LATEST dependencies.
     */
    STATIC = 'static',
}
