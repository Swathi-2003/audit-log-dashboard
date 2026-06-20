import React from 'react';

export default function FilterBar({ filters, onChange, severities, statuses }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div style={styles.bar}>
      <input
        type="text"
        placeholder="Search actor, action, resource, IP…"
        value={filters.search}
        onChange={(e) => update('search', e.target.value)}
        style={styles.search}
      />

      <select value={filters.severity} onChange={(e) => update('severity', e.target.value)} style={styles.select}>
        <option value="">All severities</option>
        {severities.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select value={filters.status} onChange={(e) => update('status', e.target.value)} style={styles.select}>
        <option value="">All statuses</option>
        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <input
        type="text"
        placeholder="Region (e.g. ap-south-1)"
        value={filters.region}
        onChange={(e) => update('region', e.target.value)}
        style={styles.select}
      />
    </div>
  );
}

const styles = {
  bar: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  search: { flex: '1 1 240px', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6 },
  select: { padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6 }
};
