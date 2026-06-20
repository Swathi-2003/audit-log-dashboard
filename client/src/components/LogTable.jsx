import React from 'react';

const COLUMNS = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'actor', label: 'Actor' },
  { key: 'action', label: 'Action' },
  { key: 'resource', label: 'Resource' },
  { key: 'severity', label: 'Severity' },
  { key: 'status', label: 'Status' },
  { key: 'region', label: 'Region' }
];

const SEVERITY_COLOR = {
  LOW: '#16a34a', MEDIUM: '#ca8a04', HIGH: '#ea580c', CRITICAL: '#dc2626'
};

export default function LogTable({ logs, sortBy, order, onSort }) {
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          {COLUMNS.map((col) => (
            <th key={col.key} style={styles.th} onClick={() => onSort(col.key)}>
              {col.label}{sortBy === col.key ? (order === 'asc' ? ' ▲' : ' ▼') : ''}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {logs.length === 0 ? (
          <tr><td colSpan={COLUMNS.length} style={styles.empty}>No logs found.</td></tr>
        ) : (
          logs.map((log) => (
            <tr key={log._id}>
              <td style={styles.td}>{new Date(log.timestamp).toLocaleString()}</td>
              <td style={styles.td}>{log.actor}</td>
              <td style={styles.td}>{log.action}</td>
              <td style={styles.td}>{log.resource}</td>
              <td style={{ ...styles.td, color: SEVERITY_COLOR[log.severity] || '#000', fontWeight: 600 }}>
                {log.severity}
              </td>
              <td style={styles.td}>{log.status}</td>
              <td style={styles.td}>{log.region}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #ddd', cursor: 'pointer', userSelect: 'none', background: '#f8f8f8' },
  td: { padding: '8px 10px', borderBottom: '1px solid #eee' },
  empty: { padding: 20, textAlign: 'center', color: '#888' }
};
