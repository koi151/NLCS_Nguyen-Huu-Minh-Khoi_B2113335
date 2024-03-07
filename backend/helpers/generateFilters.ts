// bedrooms filter
export const generateRoomFilter = (queryString: any, roomType: string): object[] => {
  if (!queryString) return [];

  const gte = queryString.includes(`${roomType}-gte`) ? queryString?.charAt(queryString.length - 1) : undefined;
  const regexStringGTE = gte ? `^${roomType}-(?=.*[${gte}-99])\\d+$` : undefined;

  return regexStringGTE ?
    [{
      "propertyDetails.rooms": {
        $elemMatch: {
          $regex: new RegExp(regexStringGTE)
        }
      }
    }]
    : [{
      "propertyDetails.rooms": {
        $elemMatch: { $eq: queryString }
      }
    }];
}

// filtering in range base on request (except area)
export const generateFilterInRange = (query: any, filterType: string): object[] => {
  if (!query || !filterType) return []; 

  const range: number[] | undefined = (query as string[])?.map(Number);

  if (!range[1]) { // in case of GTE searching
    return [{ [filterType]: { $gte: range[0] } }];
  }

  return range 
    ? [{ [filterType]: { $gte: range[0], $lte: range[1] } }] 
    : [];
}

// filtering area range (rectangle)
export const generateAreaRangeFilter = (query: any, lengthPath: string, widthPath: string): object[] => {
  if (!query || !lengthPath || !widthPath) return []; 

  const range: number[] | undefined = (query as string[])?.map(Number);

  if (!range[1]) { // in case of GTE searching 
    return [{ 
      $expr: {
        $gte: [{ $multiply: ['$area.propertyWidth', '$area.propertyLength'] }, range[0]]
      }
    }];
  }

  return range 
  ? [{
      $expr: {
        $and: [
          { $gte: [{ $multiply: [`$${widthPath}`, `$${lengthPath}`] }, range[0]] },
          { $lte: [{ $multiply: [`$${widthPath}`, `$${lengthPath}`] }, range[1]] }
        ]
      }
    }]
  : [];
}
