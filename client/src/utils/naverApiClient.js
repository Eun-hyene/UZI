import axios from 'axios';

const client = axios.create({
  baseURL: '/naver-api',
});

export const geocodeAddress = async (query) => {
  // NCP Geocoding API v2
  // Docs: https://api.ncloud-docs.com/docs/ai-naver-mapsgeocoding
  const res = await client.get('/map-geocode/v2/geocode', {
    params: { query },
  });
  return res.data;
};

export default client;

