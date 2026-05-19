export function paginated<T>(items: T[], total: number, page: number, pageSize: number) {
  const totalPages = Math.ceil(total / pageSize) || 1;
  return {
    count: total,
    next: page < totalPages ? page + 1 : null,
    previous: page > 1 ? page - 1 : null,
    results: items,
  };
}

export function skipTake(page: number, pageSize: number) {
  return { skip: (page - 1) * pageSize, take: pageSize };
}
