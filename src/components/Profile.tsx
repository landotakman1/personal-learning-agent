import React from 'react'
import { useState } from 'react'
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
  boxSizing: 'border-box'
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
  profile: Profile
  onUpdate: (field: keyof Profile, value: string | string[]) => void
}

export default function Profile({ profile, onUpdate }: Props) {
  const [newSkillArea, setNewSkillArea] = useState('')

  const addSkillArea = () => {
    const trimmed = newSkillArea.trim()
    if (!trimmed || profile.skillAreas.includes(trimmed)) return
    onUpdate('skillAreas', [...profile.skillAreas, trimmed])
    setNewSkillArea('')
  }

  const removeSkillArea = (area: string) => {
    if (profile.skillAreas.length <= 1) return
    onUpdate('skillAreas', profile.skillAreas.filter(a => a !== area))
  }

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0, textAlign: 'center' }}>Profile</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <label style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ marginBottom: 4, fontSize: 14, color: '#aaa', textAlign: 'center' }}>Background</div>
          <textarea
            value={profile.background}
            onChange={e => onUpdate('background', e.target.value)}
            rows={3}
            style={inputStyle}
          />
        </label>
        <label style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ marginBottom: 4, fontSize: 14, color: '#aaa', textAlign: 'center' }}>Career Goals</div>
          <textarea
            value={profile.goals}
            onChange={e => onUpdate('goals', e.target.value)}
            rows={3}
            style={inputStyle}
          />
        </label>

        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ marginBottom: 8, fontSize: 14, color: '#aaa', textAlign: 'center' }}>Skill Areas</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
            {profile.skillAreas.map(area => (
              <div key={area} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#2a2a2a', padding: '4px 10px', borderRadius: 20 }}>
                <span>{area}</span>
                <button
                  onClick={() => removeSkillArea(area)}
                  style={{ ...smallButtonStyle, padding: '2px 6px', background: '#555' }}
                  title="Remove"
                >
                  x
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <input
              placeholder="Add a skill area"
              value={newSkillArea}
              onChange={e => setNewSkillArea(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSkillArea()}
              style={{ ...inputStyle, maxWidth: 240 }}
            />
            <button onClick={addSkillArea} style={buttonStyle}>Add</button>
          </div>
        </div>
      </div>
    </section>
  )
}
