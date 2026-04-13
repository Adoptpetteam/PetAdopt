export type Pet = {
  id: string
  name: string
  age: number
  gender: string
  image: string
  type?: string
  category: string | {
    id: string
    name: string
    status?: string
  }
  sterilized: boolean
  vaccinated: boolean
  color: string
  description: string
  status?: string
}