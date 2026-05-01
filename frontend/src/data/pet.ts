export type Pet = {
  id: number
  name: string
  age: number
  gender: string
  image: string
  type: string
  sterilized: boolean
  color: string
}
// Du lieu: Tiem chung

export const pets: Pet[] = [

  {
    id: 1,
    name: "Alaska",
    age: 1,
    gender: "Male",
    type: "dog",
    image: "/images/Jack.png",
    sterilized: true,
    color: "white"
  },
  {
    id: 2,
    name: "Malley",
    age: 10,
    gender: "Female",
    type: "cat",
    image: "/images/Malley.png",
    sterilized: false,
    color: "gray"
  },
  {
    id: 2,
    name: "Malley",
    age: 10,
    gender: "Female",
    type: "cat",
    image: "/images/Malley.png",
    sterilized: false,
    color: "gray"
  }
  ,
  {
    id: 2,
    name: "Malley",
    age: 10,
    gender: "Female",
    type: "cat",
    image: "/images/Malley.png",
    sterilized: false,
    color: "gray"
  },
  {
    id: 2,
    name: "Malley",
    age: 10,
    gender: "Female",
    type: "cat",
    image: "/images/Malley.png",
    sterilized: false,
    color: "gray"
  }
 
]