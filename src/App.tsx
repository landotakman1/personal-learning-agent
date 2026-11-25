import { useState, useEffect } from 'react'
import './App.css'
import type { Profile, Activity } from './types'
import { getWeekStart, getMonthStart, generateInsights } from './utils'
import ProfileComponent from './components/Profile'
import ActivityLogger from './components/ActivityLogger'
import Insights from './components/Insights'
import Summaries from './components/Summaries'
import ActivityList from './components/ActivityList'

const defaultProfile: Profile = {
  background: '',
  goals: '',
  skillAreas: ['TypeScript', 'React', 'System Design', 'AI/Agents']
}

export default function App() {
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [activities, setActivities] = useState<Activity[]>([])

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

  const updateProfile = (field: keyof Profile, value: string | string[]) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const addActivity = (data: { date: string; skillArea: string; description: string; minutes: number }) => {
    const activity: Activity = {
      id: crypto.randomUUID(),
      ...data
    }
    setActivities(prev => [activity, ...prev])
  }

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  const deleteActivity = (id: string) => {
    if (confirm('Delete this activity?')) {
      setActivities(prev => prev.filter(a => a.id !== id))
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

      <ProfileComponent profile={profile} onUpdate={updateProfile} />
      <ActivityLogger profile={profile} onAdd={addActivity} />
      <Insights insights={insights} />
      <Summaries
        title="This Week"
        total={totalMinutesThisWeek}
        totals={weeklyTotals}
        emptyMessage="No activities logged this week yet."
      />
      <Summaries
        title="This Month"
        total={totalMinutesThisMonth}
        totals={monthlyTotals}
        emptyMessage="No activities logged this month yet."
      />
      <ActivityList
        activities={activities}
        profile={profile}
        onUpdate={updateActivity}
        onDelete={deleteActivity}
      />
    </div>
  )
}
