
export async function fetchAllEntities(connection, type) {
  const entites = [];
  let response;
  let offset = 0;
  const limit = 1000;
  do {
    response = await connection.v2.listEntities({
      type: type,
      limit: limit,
      offset: offset
    });
    entites.push(...response.results);
    offset += limit;
  } while(response && response.results.length);
  return entites;
}

export async function fetchEntityTypes(connection) {
  const reponse = await connection.v2.listTypes();
  return reponse.results.map((result) => {
    return result.type;
  });
}
