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

function getMonthStart(date = new Date()) {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function generateInsights(
  profile: Profile,
  weeklyTotals: Record<string, number>,
  monthlyTotals: Record<string, number>,
  totalMinutesThisWeek: number
): string[] {
  const insights: string[] = []
  const goalsLower = profile.goals.toLowerCase()

  // Low activity
  if (totalMinutesThisWeek < 60) {
    insights.push("You've logged less than an hour this week. Even a short focused session can keep momentum.")
  }

  // Skill areas mentioned in goals but under-represented this week
  profile.skillAreas.forEach(area => {
    const areaLower = area.toLowerCase()
    if (goalsLower.includes(areaLower) && (weeklyTotals[area] || 0) < 30) {
      insights.push(`Your goals mention ${area}, but you've logged little time on it this week.`)
    }
  })

  // Skill areas with zero minutes this month
  profile.skillAreas.forEach(area => {
    if ((monthlyTotals[area] || 0) === 0) {
      insights.push(`No time logged for ${area} this month yet.`)
    }
  })

  // Strong area
  const topSkill = Object.entries(weeklyTotals).sort((a, b) => b[1] - a[1])[0]
  if (topSkill && topSkill[1] >= 90) {
    insights.push(`Strong focus on ${topSkill[0]} this week (${topSkill[1]} minutes).`)
  }

  if (insights.length === 0) {
    insights.push("Looking good - your recent activity aligns reasonably with your stated goals.")
  }

  return insights.slice(0, 3) // keep it short
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

const smallButtonStyle: React.CSSProperties = {
  padding: '4px 10px',
  background: '#444',
  color: '#eee',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13
}

export default function App() {
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [activities, setActivities] = useState<Activity[]>([])
  const [newActivity, setNewActivity] = useState({
    skillArea: defaultProfile.skillAreas[0],
    description: '',
    minutes: 30,
    date: new Date().toISOString().split('T')[0] // defaults to today
  })
  const [newSkillArea, setNewSkillArea] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Activity>>({})

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

  useEffect(() => {
    if (!profile.skillAreas.includes(newActivity.skillArea) && profile.skillAreas.length > 0) {
      setNewActivity(prev => ({ ...prev, skillArea: profile.skillAreas[0] }))
    }
  }, [profile.skillAreas])

  const addActivity = () => {
    if (!newActivity.description.trim()) return
    const activity: Activity = {
      id: crypto.randomUUID(),
      date: newActivity.date,
      skillArea: newActivity.skillArea,
      description: newActivity.description,
      minutes: newActivity.minutes
    }
    setActivities(prev => [activity, ...prev])
    setNewActivity(prev => ({
        ...prev,
        description: '',
        date: new Date().toISOString().split('T')[0]
      }))
  }

  const updateProfile = (field: keyof Profile, value: string | string[]) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const addSkillArea = () => {
    const trimmed = newSkillArea.trim()
    if (!trimmed || profile.skillAreas.includes(trimmed)) return
    updateProfile('skillAreas', [...profile.skillAreas, trimmed])
    setNewSkillArea('')
  }

  const removeSkillArea = (area: string) => {
    if (profile.skillAreas.length <= 1) return
    updateProfile('skillAreas', profile.skillAreas.filter(a => a !== area))
  }

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
    setActivities(prev =>
      prev.map(a =>
        a.id === editingId
          ? { ...a, ...editForm, minutes: Number(editForm.minutes) || a.minutes }
          : a
      )
    )
    setEditingId(null)
    setEditForm({})
  }

  const deleteActivity = (id: string) => {
    if (confirm('Delete this activity?')) {
      setActivities(prev => prev.filter(a => a.id !== id))
      if (editingId === id) cancelEdit()
    }
  }

  // Weekly
  const weekStart = getWeekStart()
  const thisWeekActivities = activities.filter(a => new Date(a.date) >= weekStart)
  const weeklyTotals = thisWeekActivities.reduce((acc, a) => {
    acc[a.skillArea] = (acc[a.skillArea] || 0) + a.minutes
    return acc
  }, {} as Record<string, number>)
  const totalMinutesThisWeek = thisWeekActivities.reduce((sum, a) => sum + a.minutes, 0)

  // Monthly
  const monthStart = getMonthStart()
  const thisMonthActivities = activities.filter(a => new Date(a.date) >= monthStart)
  const monthlyTotals = thisMonthActivities.reduce((acc, a) => {
    acc[a.skillArea] = (acc[a.skillArea] || 0) + a.minutes
    return acc
  }, {} as Record<string, number>)
  const totalMinutesThisMonth = thisMonthActivities.reduce((sum, a) => sum + a.minutes, 0)

  const insights = generateInsights(profile, weeklyTotals, monthlyTotals, totalMinutesThisWeek)

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

      {/* Log Activity */}
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Log Activity</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input type="date" value="{newActivity.date}" onChange={e => setNewActivity(prev => ({ ...prev, date: e.target.value }))} style={{ ...inputStyle, width: 'auto', maxWidth: 160 }} />
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

      {/* Insights */}
      <section style={{ ...cardStyle, background: '#1a2332', borderColor: '#3b82f6' }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Insights</h2>
        <ul style={{ paddingLeft: 20, margin: 0, display: 'grid', gap: 8 }}>
          {insights.map((insight, i) => (
            <li key={i}>{insight}</li>
          ))}
        </ul>
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

      {/* This Month */}
      <section style={{ ...cardStyle, background: '#252525' }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>This Month</h2>
        <p style={{ fontSize: 18, margin: '8px 0 16px', textAlign: 'center' }}>
          <strong>{totalMinutesThisMonth}</strong> minutes total
        </p>
        {Object.keys(monthlyTotals).length === 0 ? (
          <p style={{ color: '#888', margin: 0, textAlign: 'center' }}>No activities logged this month yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 8, maxWidth: 400, margin: '0 auto' }}>
            {Object.entries(monthlyTotals).map(([skill, mins]) => (
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
          <div style={{ display: 'grid', gap: 16, maxWidth: 520, margin: '0 auto' }}>
            {activities.map(a => (
              <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid #333' }}>
                {editingId === a.id ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
                        <button onClick={() => deleteActivity(a.id)} style={{ ...smallButtonStyle, background: '#7f1d1d' }}>Delete</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
