import React from 'react';

export default function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div style={styles.wrap}>
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} style={styles.btn}>
        Previous
      </button>
      <span style={styles.label}>Page {page} of {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} style={styles.btn}>
        Next
      </button>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 },
  btn: { padding: '6px 14px', border: '1px solid #ccc', borderRadius: 6, background: '#fff', cursor: 'pointer' },
  label: { fontSize: 14, color: '#444' }
};
