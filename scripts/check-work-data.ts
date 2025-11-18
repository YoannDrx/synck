import { prisma } from "../lib/prisma"

async function checkWorkData() {
  const workId = "cmi1vf4ta009iskej35rmfc0s"

  const work = await prisma.work.findUnique({
    where: { id: workId },
    include: {
      translations: true,
      category: {
        include: {
          translations: true,
        },
      },
      label: {
        include: {
          translations: true,
        },
      },
      coverImage: true,
    },
  })

  if (!work) {
    console.log("Work not found!")
    return
  }

  console.log("\n=== WORK DATA ===")
  console.log("ID:", work.id)
  console.log("Slug:", work.slug)
  console.log("Year:", work.year)
  console.log("Duration:", work.duration)
  console.log("Release Date:", work.releaseDate)
  console.log("Genre:", work.genre)
  console.log("ISRC Code:", work.isrcCode)
  console.log("Spotify URL:", work.spotifyUrl)
  console.log("Category ID:", work.categoryId)
  console.log("Label ID:", work.labelId)
  console.log("\nTranslations:", work.translations)

  await prisma.$disconnect()
}

checkWorkData().catch(console.error)
