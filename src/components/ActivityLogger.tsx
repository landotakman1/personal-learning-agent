import React from 'react'
import { useState, useEffect } from 'react'
import type { Profile } from '../types'

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
  colorScheme: 'dark'  // helps date picker show selected value in dark mode
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

interface Props {
  profile: Profile
  onAdd: (activity: { date: string; skillArea: string; description: string; minutes: number }) => void
}

export default function ActivityLogger({ profile, onAdd }: Props) {
  const [skillArea, setSkillArea] = useState(profile.skillAreas[0] || '')
  const [description, setDescription] = useState('')
  const [minutes, setMinutes] = useState(30)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (!profile.skillAreas.includes(skillArea) && profile.skillAreas.length > 0) {
      setSkillArea(profile.skillAreas[0])
    }
  }, [profile.skillAreas, skillArea])

  const handleAdd = () => {
    if (!description.trim()) return
    onAdd({ date, skillArea, description, minutes })
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
  }

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0, textAlign: 'center' }}>Log Activity</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ ...inputStyle, width: 'auto', maxWidth: 160 }}
          />
          <select
            value={skillArea}
            onChange={e => setSkillArea(e.target.value)}
            style={{ ...inputStyle, width: 'auto', minWidth: 140, maxWidth: 200 }}
          >
            {profile.skillAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="number"
              value={minutes}
              onChange={e => setMinutes(Number(e.target.value))}
              style={{ ...inputStyle, width: 70, maxWidth: 70 }}
            />
            <span style={{ color: '#aaa' }}>minutes</span>
          </div>
        </div>
        <input
          placeholder="What did you study / practice?"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={inputStyle}
        />
        <button onClick={handleAdd} style={buttonStyle}>Add Activity</button>
      </div>
    </section>
  )
}
