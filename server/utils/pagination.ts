export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function parsePaginationParams(pageQuery?: any, limitQuery?: any): PaginationParams {
  let page = parseInt(String(pageQuery || '1'), 10);
  let limit = parseInt(String(limitQuery || '50'), 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 50;

  // Maximum limit constraint = 100
  if (limit > 100) limit = 100;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function applyPagination<T>(items: T[], pageQuery?: any, limitQuery?: any): PaginatedResult<T> {
  const { page, limit, offset } = parsePaginationParams(pageQuery, limitQuery);
  const total = items.length;
  const data = items.slice(offset, offset + limit);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}
