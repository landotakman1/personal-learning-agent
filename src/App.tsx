import { useState, useEffect } from 'react'
import './App.css'

type Profile = {
  background: string
  goals: string
  skillAreas: string[]
}

type Activity = {
  id: string
  date: string
  skillArea: string
  description: string
  minutes: number
}

const defaultProfile: Profile = {
  background: '',
  goals: '',
  skillAreas: ['TypeScript', 'React', 'System Design', 'AI/Agents']
}

function getWeekStart(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

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

export default function App() {
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [activities, setActivities] = useState<Activity[]>([])
  const [newActivity, setNewActivity] = useState({
    skillArea: defaultProfile.skillAreas[0],
    description: '',
    minutes: 30
  })

  useEffect(() => {
    const savedProfile = localStorage.getItem('pla-profile')
    const savedActivities = localStorage.getItem('pla-activities')
    if (savedProfile) setProfile(JSON.parse(savedProfile))
    if (savedActivities) setActivities(JSON.parse(savedActivities))
  }, [])

  useEffect(() => {
    localStorage.setItem('pla-profile', JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    localStorage.setItem('pla-activities', JSON.stringify(activities))
  }, [activities])

  const addActivity = () => {
    if (!newActivity.description.trim()) return
    const activity: Activity = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      ...newActivity
    }
    setActivities(prev => [activity, ...prev])
    setNewActivity(prev => ({ ...prev, description: '' }))
  }

  const updateProfile = (field: keyof Profile, value: string | string[]) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const weekStart = getWeekStart()
  const thisWeekActivities = activities.filter(a => new Date(a.date) >= weekStart)
  const weeklyTotals = thisWeekActivities.reduce((acc, a) => {
    acc[a.skillArea] = (acc[a.skillArea] || 0) + a.minutes
    return acc
  }, {} as Record<string, number>)
  const totalMinutesThisWeek = thisWeekActivities.reduce((sum, a) => sum + a.minutes, 0)

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px', fontFamily: 'system-ui, sans-serif', color: '#eee' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 32 }}>Personal Learning Agent</h1>

      {/* Profile */}
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Profile</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <label style={{ width: '100%', maxWidth: 480 }}>
            <div style={{ marginBottom: 4, fontSize: 14, color: '#aaa', textAlign: 'center' }}>Background</div>
            <textarea
              value={profile.background}
              onChange={e => updateProfile('background', e.target.value)}
              rows={3}
              style={inputStyle}
            />
          </label>
          <label style={{ width: '100%', maxWidth: 480 }}>
            <div style={{ marginBottom: 4, fontSize: 14, color: '#aaa', textAlign: 'center' }}>Career Goals</div>
            <textarea
              value={profile.goals}
              onChange={e => updateProfile('goals', e.target.value)}
              rows={3}
              style={inputStyle}
            />
          </label>
          <div style={{ fontSize: 14, textAlign: 'center' }}>
            <span style={{ color: '#aaa' }}>Skill Areas: </span>
            {profile.skillAreas.join(', ')}
          </div>
        </div>
      </section>

      {/* Log Activity */}
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Log Activity</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <select
              value={newActivity.skillArea}
              onChange={e => setNewActivity(prev => ({ ...prev, skillArea: e.target.value }))}
              style={{ ...inputStyle, width: 'auto', minWidth: 140, maxWidth: 200 }}
            >
              {profile.skillAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number"
                value={newActivity.minutes}
                onChange={e => setNewActivity(prev => ({ ...prev, minutes: Number(e.target.value) }))}
                style={{ ...inputStyle, width: 70, maxWidth: 70 }}
              />
              <span style={{ color: '#aaa' }}>minutes</span>
            </div>
          </div>
          <input
            placeholder="What did you study / practice?"
            value={newActivity.description}
            onChange={e => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
            style={inputStyle}
          />
          <button onClick={addActivity} style={buttonStyle}>Add Activity</button>
        </div>
      </section>

      {/* This Week */}
      <section style={{ ...cardStyle, background: '#252525' }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>This Week</h2>
        <p style={{ fontSize: 18, margin: '8px 0 16px', textAlign: 'center' }}>
          <strong>{totalMinutesThisWeek}</strong> minutes total
        </p>
        {Object.keys(weeklyTotals).length === 0 ? (
          <p style={{ color: '#888', margin: 0, textAlign: 'center' }}>No activities logged this week yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 8, maxWidth: 400, margin: '0 auto' }}>
            {Object.entries(weeklyTotals).map(([skill, mins]) => (
              <div key={skill} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #333' }}>
                <span>{skill}</span>
                <strong>{mins} min</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activities */}
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Recent Activities</h2>
        {activities.length === 0 ? (
          <p style={{ color: '#888', margin: 0, textAlign: 'center' }}>No activities logged yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12, maxWidth: 520, margin: '0 auto' }}>
            {activities.map(a => (
              <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{a.date}</div>
                <div>
                  <strong>{a.skillArea}</strong>
                  <span style={{ color: '#aaa' }}> ú {a.minutes} min</span>
                </div>
                <div style={{ marginTop: 4 }}>{a.description}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
