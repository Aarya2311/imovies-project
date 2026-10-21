# iMovies

A small movie-booking starter project with a React frontend and an Express,
MongoDB-backed API.

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a MongoDB connection string

## Run the backend

Set your MongoDB connection string in `backend/.env` (copy
`backend/.env.example` as a template). Keep the real connection string private
and do not commit the `.env` file. Then, in a terminal:

```powershell
cd backend
npm install
npm run dev
```

The API starts at `http://localhost:5000`. You can change the port with
`PORT` and set `FRONTEND_URL` in `backend/.env` if the frontend is served
from a different origin. Booking dates and showtimes use the backend host's
local timezone; configure the Node process timezone to the theater's timezone.

On the first successful connection, the backend seeds its sample movie
catalogue when the movies collection is empty. On later starts, it adds any
missing sample titles and fills missing release dates, trailer URLs, and ticket
prices. It also refreshes poster URLs for seeded titles without replacing
other existing movie edits.

## Refresh movie posters

The seed catalogue includes poster URLs. To update the poster URLs on sample
movie records without replacing other movie or booking data,
run this from the `backend` directory:

```powershell
npm run update:posters
```

The poster files are served by TMDB and Wikimedia. Movie cards show styled
fallback artwork if a poster URL is unavailable.

## Run the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm start
```

The development app opens at `http://localhost:3000`. Set
`REACT_APP_API_URL` before starting it if the API is not at
`http://localhost:5000`.

## Movies and bookings

Movies are fetched from MongoDB by the frontend. Search and genre filters run
against the fetched catalogue. Signed-in admins and owners can add movies from
the frontend form; the movie creation API also requires an authenticated
admin/owner session.

The frontend shows the **+ Add Movie** form and **Delete Movie** button only
to `admin` and `owner` accounts. Customers can browse and book but cannot
manage the catalogue. Deletion is refused for movies that already have
bookings. Each ticket has a rupee price, and checkout shows the calculated
total with simulated UPI, card, and net banking options. Payment credentials
are not sent to the API; this demo does not process or charge real payments.

Existing sample movies are automatically assigned their seed prices at backend
startup if their price is missing. You can explicitly reset prices on those
seed titles with `npm run update:prices` from `backend`.

The checkout supports mock UPI (Google Pay, PhonePe, or Paytm), demo card
details, and demo net banking. For the card flow, use the displayed test values
only; payment details are kept in the browser and never sent to the backend.
The demo shows a two-second processing state, then confirms payment and saves
the booking. No real payment is processed.

## API

- `GET /api/health` — check that the API is running
- `POST /api/auth/register` — create an account and start a session
- `POST /api/auth/login` — log in and start a session
- `GET /api/auth/me` — get the current session user
- `POST /api/auth/logout` — end the current session
- `GET /api/movies` — list movies; optional `search` and `genre` query filters
- `GET /api/movies/:id` — get a movie
- `POST /api/movies` — add a movie
- `PUT /api/movies/:id` — update a movie
- `DELETE /api/movies/:id` — delete a movie (only when it has no bookings)
- `GET /api/bookings` — list bookings
- `POST /api/bookings` — book seats for a movie
- `POST /api/bookings/:id/cancel` — cancel an owned booking (at least 5 hours
  before its showtime) or any booking as an admin/owner
- `GET /api/bookings/admin` — list all bookings for admins/owners

Roles are `customer`, `admin`, and `owner`. Public registration always creates
a `customer`; submitted role values are ignored. The signup form includes a
role selector, but only customer registration is available; admin and owner
access is assigned separately. Movie browsing is public, booking endpoints
require login, and movie create/update/delete endpoints require `admin` or
`owner`. Booking management is also restricted to admins and owners. Roles are
loaded from MongoDB for each authorized request rather than trusted from browser
data.

To bootstrap an owner on backend startup, configure `OWNER_EMAIL` and
`OWNER_PASSWORD` in `backend/.env` (use a unique password of 12-72 UTF-8 bytes
and keep it private). The owner is created if absent. If an account with that
email already exists, it is promoted only when its password matches the
configured owner password. Do not set `OWNER_PASSWORD` in source control.
Passwords are hashed and sessions use an HTTP-only cookie. The frontend also
stores the session token in local storage and sends it as a Bearer token for API
requests. Because browser JavaScript can access local storage, protect the app
against cross-site scripting. Configure a strong, private `JWT_SECRET` in
`backend/.env`.

The header profile icon opens the login/signup popup, and choosing **Book
Ticket** prompts for login only when needed. After login, the app returns to
the selected movie’s booking step. Signed-in users can open the profile menu
to log out.

Movie records include `price` in whole rupees. Booking requests include
`movie` (the movie ID), `showDate`, `showtime`, and `seats` (a whole number
between 1 and 10). The API takes customer details from the authenticated
account and calculates/stores ticket price and total using the current movie
price; client-supplied totals and payment credentials are not trusted. Older
bookings without a show date use their creation date for cancellation checks.
