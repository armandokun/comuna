import { faker } from '@faker-js/faker'

const data = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  created_at: faker.date.recent().toISOString(),
  image_url: faker.image.urlPicsumPhotos({
    width: 300,
    height: 300 * 1.4,
    blur: 0,
  }),
  description: faker.lorem.sentences({ min: 1, max: 3 }),
  author: {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    avatar_url: faker.image.avatarGitHub(),
  },
}))

export type Post = (typeof data)[0]
export default data
