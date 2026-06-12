export function mapValidDtos<TDto, TDomain>(
  dtos: TDto[],
  mapper: (dto: TDto) => TDomain,
): TDomain[] {
  const mapped: TDomain[] = [];

  for (const dto of dtos) {
    try {
      mapped.push(mapper(dto));
    } catch (error) {
      console.warn("World Cup 2026 API record ignored.", error);
    }
  }

  return mapped;
}
