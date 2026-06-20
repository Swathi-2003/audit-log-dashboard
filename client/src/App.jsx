import React, { useEffect, useState, useCallback } from 'react';
import FilterBar from './components/FilterBar.jsx';
import LogTable from './components/LogTable.jsx';
import Pagination from './components/Pagination.jsx';

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['Resolved', 'Unresolved'];

export default function App() {
  const [filters, setFilters] = useState({
    severity: '', status: '', region: '', search: ''
  });
  const [sortBy, setSortBy] = useState('timestamp');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  const [data, setData] = useState({ logs: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
        sortBy, order, page, limit
      });
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_BASE}/api/logs?${params.toString()}`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, order, page, limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Any filter change resets pagination to page 1
  const handleFilterChange = (next) => {
    setFilters(next);
    setPage(1);
  };

  const handleSort = (field) => {
    if (field === sortBy) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
    setPage(1);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Security Audit Log Dashboard</h1>

      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        severities={SEVERITIES}
        statuses={STATUSES}
      />

      {error && <div style={styles.error}>Error: {error}</div>}

      <div style={styles.meta}>
        {loading ? 'Loading…' : `${data.total} results`}
      </div>

      <LogTable
        logs={data.logs}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
      />

      <Pagination
        page={data.page || page}
        totalPages={data.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}

const styles = {
  page: { fontFamily: 'system-ui, sans-serif', maxWidth: 1100, margin: '0 auto', padding: 24 },
  title: { fontSize: 22, marginBottom: 16 },
  meta: { margin: '12px 0', color: '#555', fontSize: 14 },
  error: { background: '#fee2e2', color: '#991b1b', padding: 10, borderRadius: 6, marginBottom: 12 }
};
