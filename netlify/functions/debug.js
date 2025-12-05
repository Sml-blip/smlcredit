export const handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      env_keys: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('NETLIFY')).sort(),
      node_version: process.version,
      has_pg: !!require.cache[require.resolve('pg')]
    })
  };
};
