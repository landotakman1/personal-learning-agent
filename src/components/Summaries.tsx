import React from 'react'
const cardStyle: React.CSSProperties = {
  background: '#252525',
  border: '1px solid #333',
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
  padding: 24,
  marginBottom: 24
}

interface Props {
  title: string
  total: number
  totals: Record<string, number>
  emptyMessage: string
}

export default function Summaries({ title, total, totals, emptyMessage }: Props) {
  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0, textAlign: 'center' }}>{title}</h2>
      <p style={{ fontSize: 18, margin: '8px 0 16px', textAlign: 'center' }}>
        <strong>{total}</strong> minutes total
      </p>
      {Object.keys(totals).length === 0 ? (
        <p style={{ color: '#888', margin: 0, textAlign: 'center', fontStyle: 'italic' }}>{emptyMessage}</p>
      ) : (
        <div style={{ display: 'grid', gap: 8, maxWidth: 400, margin: '0 auto' }}>
          {Object.entries(totals).map(([skill, mins]) => (
            <div key={skill} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #333' }}>
              <span>{skill}</span>
              <strong>{mins} min</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
