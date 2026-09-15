/**
 * Generic pagination metadata detailing current page, page size, total record count, and total page count.
 */
export interface PaginationMetadata {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
}

/**
 * Generic paginated result wrapper containing an array of data items and associated pagination metadata.
 *
 * @template T - The type of items included in the data array.
 */
export interface PaginatedResult<T> {
    data: T[];
    pagination: PaginationMetadata;
}
