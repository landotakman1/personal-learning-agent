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
        if (savedProfile) {
            setProfile(JSON.parse(savedProfile))
          }
        if (savedActivities) {
            setActivities(JSON.parse(savedActivities))
          }
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

      return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24, fontFamily: 'system-ui' }}>
      <h1>Personal Learning Agent</h1>

      {/* Profile */}
      <section style={{ marginBottom: 32 }}>
        <h2>Profile</h2>
        <label>
          Background<br />
          <textarea
            value={profile.background}
            onChange={e => updateProfile('background', e.target.value)}
            rows={3}
            style={{ width: '100%' }}
          />
        </label>
        <br /><br />
        <label>
          Career Goals<br />
          <textarea
            value={profile.goals}
            onChange={e => updateProfile('goals', e.target.value)}
            rows={3}
            style={{ width: '100%' }}
          />
        </label>
        <br /><br />
        <div>
          <strong>Skill Areas:</strong> {profile.skillAreas.join(', ')}
        </div>
      </section>

      {/* Log Activity */}
      <section style={{ marginBottom: 32 }}>
        <h2>Log Activity</h2>
        <select
          value={newActivity.skillArea}
          onChange={e => setNewActivity(prev => ({ ...prev, skillArea: e.target.value }))}
        >
          {profile.skillAreas.map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
        {' '}
        <input
          type="number"
          value={newActivity.minutes}
          onChange={e => setNewActivity(prev => ({ ...prev, minutes: Number(e.target.value) }))}
          style={{ width: 80 }}
        /> minutes
        <br /><br />
        <input
          placeholder="What did you study / practice?"
          value={newActivity.description}
          onChange={e => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <button onClick={addActivity}>Add Activity</button>
      </section>

      {/* Weekly View */}
      <section>
        <h2>Recent Activities</h2>
        {activities.length === 0 && <p>No activities logged yet.</p>}
        <ul style={{ paddingLeft: 20 }}>
          {activities.map(a => (
            <li key={a.id} style={{ marginBottom: 8 }}>
              <strong>{a.date}</strong> - {a.skillArea} ({a.minutes} min): {a.description}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
  }
