const axios = require('axios');

const geocodeAddress = async (address) => {
  if (!address) {
    console.log('failed geocode');
    return null;
  }

  try {
    const res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (res.data.status === 'OK' && res.data.results.length > 0) {
      const { lat, lng } = res.data.results[0].geometry.location;
      return { lat, lng };
    }

    console.warn(`Geocoding failed for '${address}' - status: ${res.data.status}`);
    return null;
  } catch (err) {
    console.error('Error geocoding address:', err.message);
    return null;
  }
}

module.exports = geocodeAddress;