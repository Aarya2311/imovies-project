const Movie = require("../models/Movie");

const seedMovies = [
  {
    title: "Dune: Part Two",
    description:
      "Paul Atreides joins Chani and the Fremen as he faces the choices that will shape the future of Arrakis.",
    genre: "Science Fiction",
    releaseYear: 2024,
    durationMinutes: 166,
    rating: 8.5,
    price: 350,
    posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    showtimes: ["1:30 PM", "5:15 PM", "9:00 PM"],
  },
  {
    title: "Oppenheimer",
    description:
      "Physicist J. Robert Oppenheimer and his team work on the wartime project that leads to the first atomic bomb.",
    genre: "Drama",
    releaseYear: 2023,
    durationMinutes: 180,
    rating: 8.3,
    price: 350,
    posterUrl: "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
    showtimes: ["12:30 PM", "4:30 PM", "8:30 PM"],
  },
  {
    title: "Barbie",
    description:
      "Barbie leaves her familiar world for the real one and discovers new questions about identity and belonging.",
    genre: "Comedy",
    releaseYear: 2023,
    durationMinutes: 114,
    rating: 7.0,
    price: 250,
    posterUrl: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
    showtimes: ["12:00 PM", "3:00 PM", "6:30 PM"],
  },
  {
    title: "Spider-Man: Across the Spider-Verse",
    description:
      "Miles Morales travels across dimensions and meets a team of Spider-people with very different ideas about heroism.",
    genre: "Animation",
    releaseYear: 2023,
    durationMinutes: 140,
    rating: 8.6,
    price: 300,
    posterUrl:
      "https://upload.wikimedia.org/wikipedia/en/b/b4/Spider-Man-_Across_the_Spider-Verse_poster.jpg",
    showtimes: ["1:00 PM", "4:00 PM", "7:30 PM"],
  },
  {
    title: "The Batman",
    description:
      "In his second year as Gotham's protector, Batman follows a trail of clues left by a criminal targeting the city's elite.",
    genre: "Action",
    releaseYear: 2022,
    durationMinutes: 176,
    rating: 7.8,
    price: 300,
    posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    showtimes: ["12:45 PM", "4:45 PM", "8:45 PM"],
  },
  {
    title: "Everything Everywhere All at Once",
    description:
      "An overwhelmed laundromat owner discovers she can connect with other versions of herself across the multiverse.",
    genre: "Science Fiction",
    releaseYear: 2022,
    durationMinutes: 139,
    rating: 7.8,
    price: 300,
    posterUrl: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    showtimes: ["12:15 PM", "3:45 PM", "7:15 PM"],
  },
  {
    title: "Top Gun: Maverick",
    description:
      "A veteran naval aviator returns to train a new generation of pilots for a demanding special assignment.",
    genre: "Action",
    releaseYear: 2022,
    durationMinutes: 130,
    rating: 8.2,
    price: 300,
    posterUrl: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    showtimes: ["1:15 PM", "4:15 PM", "7:45 PM"],
  },
  {
    title: "The Grand Budapest Hotel",
    description:
      "A devoted hotel concierge and his young protégé become entangled in a family dispute over a valuable painting.",
    genre: "Comedy",
    releaseYear: 2014,
    durationMinutes: 99,
    rating: 8.1,
    price: 250,
    posterUrl: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
    showtimes: ["12:00 PM", "2:45 PM", "6:00 PM"],
  },
  {
    title: "Interstellar",
    description:
      "A team of explorers travels beyond Earth in search of a future for humanity as time and distance reshape their mission.",
    genre: "Science Fiction",
    releaseDate: new Date("2014-11-07T00:00:00.000Z"),
    releaseYear: 2014,
    durationMinutes: 169,
    rating: 8.7,
    price: 350,
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    showtimes: ["1:00 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "Parasite",
    description:
      "A struggling family gradually finds work in a wealthy household, setting two very different lives on a collision course.",
    genre: "Thriller",
    releaseYear: 2019,
    durationMinutes: 132,
    rating: 8.5,
    price: 300,
    posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    showtimes: ["12:30 PM", "3:45 PM", "7:00 PM"],
  },
  {
    title: "Avatar",
    description:
      "A former Marine joins an expedition to Pandora, where he must choose between the mission and the world he has come to know.",
    genre: "Science Fiction",
    releaseDate: new Date("2009-12-18T00:00:00.000Z"),
    releaseYear: 2009,
    durationMinutes: 162,
    rating: 7.9,
    price: 300,
    posterUrl:
      "https://upload.wikimedia.org/wikipedia/en/d/d6/Avatar_%282009_film%29_poster.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=5PSNL1qE6VY",
    showtimes: ["12:30 PM", "4:30 PM", "8:30 PM"],
  },
  {
    title: "Avatar: The Way of Water",
    description:
      "Jake Sully and his family seek refuge among Pandora's ocean people while a renewed threat pursues them.",
    genre: "Science Fiction",
    releaseDate: new Date("2022-12-16T00:00:00.000Z"),
    releaseYear: 2022,
    durationMinutes: 192,
    rating: 7.5,
    price: 350,
    posterUrl:
      "https://upload.wikimedia.org/wikipedia/en/5/54/Avatar_The_Way_of_Water_poster.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
    showtimes: ["12:00 PM", "4:00 PM", "8:00 PM"],
  },
  {
    title: "Animal",
    description:
      "After an attack on his father, a businessman's son returns home and pursues a violent path of revenge.",
    genre: "Action Drama",
    releaseDate: new Date("2023-12-01T00:00:00.000Z"),
    releaseYear: 2023,
    durationMinutes: 201,
    rating: 6.2,
    price: 300,
    posterUrl:
      "https://upload.wikimedia.org/wikipedia/en/9/90/Animal_%282023_film%29_poster.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=8FkLRUJj-o0",
    showtimes: ["12:00 PM", "4:30 PM", "9:00 PM"],
  },
  {
    title: "Jawan",
    description:
      "A masked vigilante and his team take on corruption through a series of high-profile operations.",
    genre: "Action Thriller",
    releaseDate: new Date("2023-09-07T00:00:00.000Z"),
    releaseYear: 2023,
    durationMinutes: 169,
    rating: 7.0,
    price: 300,
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/3/39/Jawan_film_poster.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=COv52Qyctws",
    showtimes: ["12:30 PM", "4:30 PM", "8:30 PM"],
  },
  {
    title: "KGF: Chapter 1",
    description:
      "Rocky rises through Mumbai's criminal underworld and sets his sights on the powerful gold fields of Kolar.",
    genre: "Action Drama",
    releaseDate: new Date("2018-12-21T00:00:00.000Z"),
    releaseYear: 2018,
    durationMinutes: 156,
    rating: 8.2,
    price: 250,
    posterUrl:
      "https://upload.wikimedia.org/wikipedia/en/c/cc/K.G.F_Chapter_1_poster.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled",
    trailerUrl: "https://www.youtube.com/watch?v=-KfsY-qwBS0",
    showtimes: ["1:00 PM", "5:00 PM", "9:00 PM"],
  },
  {
    title: "KGF: Chapter 2",
    description:
      "Rocky consolidates his power in the Kolar Gold Fields as rivals and government forces close in.",
    genre: "Action Drama",
    releaseDate: new Date("2022-04-14T00:00:00.000Z"),
    releaseYear: 2022,
    durationMinutes: 168,
    rating: 8.2,
    price: 300,
    posterUrl:
      "https://upload.wikimedia.org/wikipedia/en/d/d0/K.G.F_Chapter_2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled",
    trailerUrl: "https://www.youtube.com/watch?v=JKa05nyUmuQ",
    showtimes: ["12:30 PM", "4:30 PM", "8:30 PM"],
  },
];

async function seedMoviesIfNeeded() {
  const movieCount = await Movie.countDocuments();
  const existingMovies = await Movie.find(
    { title: { $in: seedMovies.map(({ title }) => title) } },
    "title posterUrl releaseDate trailerUrl"
  ).lean();
  const existingByTitle = new Map(existingMovies.map((movie) => [movie.title, movie]));
  const missingMovies = seedMovies.filter(({ title }) => !existingByTitle.has(title));

  if (missingMovies.length > 0) {
    await Movie.insertMany(missingMovies);
    console.log(`Added ${missingMovies.length} missing movies from the sample catalogue.`);
  }

  const metadataUpdates = seedMovies.flatMap((movie) => {
    const existing = existingByTitle.get(movie.title);
    if (!existing) {
      return [];
    }

    const missingMetadata = {};
    if (!existing.releaseDate && movie.releaseDate) {
      missingMetadata.releaseDate = movie.releaseDate;
    }
    if (!existing.trailerUrl && movie.trailerUrl) {
      missingMetadata.trailerUrl = movie.trailerUrl;
    }
    if (existing.posterUrl !== movie.posterUrl) {
      missingMetadata.posterUrl = movie.posterUrl;
    }
    return Object.keys(missingMetadata).length
      ? [{ updateOne: { filter: { title: movie.title }, update: { $set: missingMetadata } } }]
      : [];
  });
  if (metadataUpdates.length > 0) {
    await Movie.bulkWrite(metadataUpdates);
  }

  const priceUpdates = seedMovies.map(({ title, price }) => ({
    updateOne: {
      filter: {
        title,
        $or: [{ price: { $exists: false } }, { price: null }, { price: 0 }],
      },
      update: { $set: { price } },
    },
  }));
  const result = await Movie.bulkWrite(priceUpdates);
  if (result.modifiedCount > 0) {
    console.log(`Added default ticket prices to ${result.modifiedCount} existing movie(s).`);
  }

  if (movieCount === 0) {
    console.log(`Seeded ${seedMovies.length} sample movies.`);
  } else if (missingMovies.length === 0 && metadataUpdates.length === 0) {
    console.log(`Movie seed skipped; ${movieCount} movie(s) already exist.`);
  }
}

module.exports = { seedMovies, seedMoviesIfNeeded };
