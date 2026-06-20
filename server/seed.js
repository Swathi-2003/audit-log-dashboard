// Generates mock audit logs and POSTs them to /api/logs/bulk in chunks of 1000.
// Usage: npm run seed   (make sure the server is running on PORT first)
require('dotenv').config();
const { faker } = require('@faker-js/faker');

const ACTIONS = ['DELETE_USER', 'CREATE_USER', 'UPDATE_PERMISSIONS', 'LOGIN', 'LOGIN_FAILED', 'EXPORT_DATA', 'DELETE_RESOURCE'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['Resolved', 'Unresolved'];
const REGIONS = ['ap-south-1', 'us-east-1', 'eu-west-1', 'ap-southeast-1'];
const ROLES = ['admin', 'editor', 'viewer'];

function generateLog() {
  return {
    actor: faker.internet.email(),
    role: faker.helpers.arrayElement(ROLES),
    action: faker.helpers.arrayElement(ACTIONS),
    resource: `/api/users/${faker.number.int({ min: 1, max: 9999 })}`,
    resourceType: 'USER',
    ipAddress: faker.internet.ip(),
    region: faker.helpers.arrayElement(REGIONS),
    severity: faker.helpers.arrayElement(SEVERITIES),
    status: faker.helpers.arrayElement(STATUSES),
    timestamp: faker.date.recent({ days: 90 }).toISOString()
  };
}

async function seed() {
  const TOTAL = 10000;
  const CHUNK = 1000;
  const baseUrl = `http://localhost:${process.env.PORT || 5000}/api/logs/bulk`;

  for (let i = 0; i < TOTAL; i += CHUNK) {
    const logs = Array.from({ length: CHUNK }, generateLog);
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs })
    });
    const data = await res.json();
    console.log(`Chunk ${i / CHUNK + 1}: inserted ${data.inserted}/${logs.length}`);
  }
  console.log('Seeding complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
