import { faker } from '@faker-js/faker'

const data = Array.from({ length: 20 }, () => ({
  key: faker.string.uuid(),
  title: faker.music.artist(),
  image: faker.image.urlPicsumPhotos({
    width: 300,
    height: 300 * 1.4,
    blur: 0,
  }),
  bg: faker.internet.color(),
  description: faker.lorem.sentences({ min: 1, max: 3 }),
  author: {
    name: faker.person.fullName(),
    avatar: faker.image.avatarGitHub(),
  },
}))

export type Item = (typeof data)[0]
export default data
