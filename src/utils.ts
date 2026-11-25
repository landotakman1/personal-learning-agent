import type { Profile } from './types'

export function getWeekStart(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getMonthStart(date = new Date()) {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

export function generateInsights(
  profile: Profile,
  weeklyTotals: Record<string, number>,
  monthlyTotals: Record<string, number>,
  totalMinutesThisWeek: number
): string[] {
  const insights: string[] = []
  const goalsLower = profile.goals.toLowerCase()

  if (totalMinutesThisWeek < 60) {
    insights.push("You've logged less than an hour this week. Even a short focused session can keep momentum.")
  }

  profile.skillAreas.forEach(area => {
    const areaLower = area.toLowerCase()
    if (goalsLower.includes(areaLower) && (weeklyTotals[area] || 0) < 30) {
      insights.push(`Your goals mention ${area}, but you've logged little time on it this week.`)
    }
  })

  profile.skillAreas.forEach(area => {
    if ((monthlyTotals[area] || 0) === 0) {
      insights.push(`No time logged for ${area} this month yet.`)
    }
  })

  const topSkill = Object.entries(weeklyTotals).sort((a, b) => b[1] - a[1])[0]
  if (topSkill && topSkill[1] >= 90) {
    insights.push(`Strong focus on ${topSkill[0]} this week (${topSkill[1]} minutes).`)
  }

  if (insights.length === 0) {
    insights.push("Looking good - your recent activity aligns reasonably with your stated goals.")
  }

  return insights.slice(0, 3)
}
