const fetchInstitutionNames =  async (client, institutionIds) => {
    // memoize names
    const seen = {};
    await Promise.all(
      [...institutionIds].map(async id => {
        const { data } = await client.institutionsGetById({
          institution_id: id,
          country_codes: ['US'],
        });
        seen[id] = data.institution.name;
      }),
    );
    return seen;
  }
  module.exports = fetchInstitutionNames;