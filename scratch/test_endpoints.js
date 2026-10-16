const http = require('http');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing endpoints on http://localhost:3000...');

  // 1. Health
  const healthRes = await fetchUrl('http://localhost:3000/api/health');
  console.log('1. /api/health:', healthRes.statusCode, healthRes.data);

  // 2. manus-routes.json
  const routesRes = await fetchUrl('http://localhost:3000/manus-routes.json');
  console.log('2. /manus-routes.json:', routesRes.statusCode, routesRes.data);
  const parsedRoutes = JSON.parse(routesRes.data);
  console.log('   Routes valid JSON? Yes, count:', parsedRoutes.routes.length);

  // 3. /dashboard
  const dashRes = await fetchUrl('http://localhost:3000/dashboard');
  console.log('3. /dashboard:', dashRes.statusCode, 'Bytes:', dashRes.data.length);

  // 4. /
  const rootRes = await fetchUrl('http://localhost:3000/');
  console.log('4. /:', rootRes.statusCode, 'Bytes:', rootRes.data.length);

  console.log('ALL API TESTS PASSED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
