import React from 'react'
import { useState } from 'react'
import type { Activity, Profile } from '../types'

const cardStyle: React.CSSProperties = {
  background: '#1e1e1e',
  border: '1px solid #333',
  borderRadius: 12,
  padding: 24,
  marginBottom: 24
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 480,
  padding: '8px 12px',
  background: '#2a2a2a',
  border: '1px solid #444',
  borderRadius: 6,
  color: '#eee',
  fontSize: 14,
  boxSizing: 'border-box',
  colorScheme: 'dark'
}

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontWeight: 500
}

const smallButtonStyle: React.CSSProperties = {
  padding: '4px 10px',
  background: '#444',
  color: '#eee',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13
}

interface Props {
  activities: Activity[]
  profile: Profile
  onUpdate: (id: string, updates: Partial<Activity>) => void
  onDelete: (id: string) => void
}

export default function ActivityList({ activities, profile, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Activity>>({})

  const startEdit = (activity: Activity) => {
    setEditingId(activity.id)
    setEditForm({ ...activity })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = () => {
    if (!editingId || !editForm.description?.trim()) return
    onUpdate(editingId, {
      ...editForm,
      minutes: Number(editForm.minutes) || 0
    })
    setEditingId(null)
    setEditForm({})
  }

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0, textAlign: 'center' }}>Recent Activities</h2>
      {activities.length === 0 ? (
        <p style={{ color: '#888', margin: 0, textAlign: 'center' }}>No activities logged yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16, maxWidth: 520, margin: '0 auto' }}>
          {activities.map(a => (
            <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid #333' }}>
              {editingId === a.id ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input
                      type="date"
                      value={editForm.date || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                      style={{ ...inputStyle, width: 'auto', maxWidth: 160 }}
                    />
                    <select
                      value={editForm.skillArea || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, skillArea: e.target.value }))}
                      style={{ ...inputStyle, width: 'auto', minWidth: 120 }}
                    >
                      {profile.skillAreas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={editForm.minutes || 0}
                      onChange={e => setEditForm(prev => ({ ...prev, minutes: Number(e.target.value) }))}
                      style={{ ...inputStyle, width: 70 }}
                    />
                  </div>
                  <input
                    value={editForm.description || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    style={inputStyle}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={saveEdit} style={buttonStyle}>Save</button>
                    <button onClick={cancelEdit} style={smallButtonStyle}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{a.date}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <strong>{a.skillArea}</strong>
                      <span style={{ color: '#aaa' }}> ú {a.minutes} min</span>
                      <div style={{ marginTop: 4 }}>{a.description}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => startEdit(a)} style={smallButtonStyle}>Edit</button>
                      <button onClick={() => onDelete(a.id)} style={{ ...smallButtonStyle, background: '#7f1d1d' }}>Delete</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
