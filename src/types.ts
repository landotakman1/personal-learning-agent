export type Profile = {
  background: string
  goals: string
  skillAreas: string[]
}

export type Activity = {
  id: string
  date: string
  skillArea: string
  description: string
  minutes: number
}
