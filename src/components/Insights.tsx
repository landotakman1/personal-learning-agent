import React from 'react'
const cardStyle: React.CSSProperties = {
  background: '#1a2332',
  border: '1px solid #3b82f6',
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
  padding: 24,
  marginBottom: 24
}

interface Props {
  insights: string[]
}

export default function Insights({ insights }: Props) {
  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0, textAlign: 'center' }}>Insights</h2>
      <ul style={{ paddingLeft: 20, margin: 0, display: 'grid', gap: 8 }}>
        {insights.map((insight, i) => (
          <li key={i}>{insight}</li>
        ))}
      </ul>
    </section>
  )
}
