# 🎬 My Top Movies

A responsive Flask web application to manage your favorite movies.

Search for movies via the [TMDb API](https://developer.themoviedb.org/), add them manually, edit, delete, or reset movies. Built with PostgreSQL, Bootstrap 5, and Flask.

<br>

## 🚀 Features

- 🔍 Search movies by title (using TMDb API)
- 📝 Manually add movies
- 🖼️ View top movies ranked with poster, rating, and description
- ✏️ Edit movie details
- 🗑️ Delete movies
- 🔄 Reset to default movie list
- 🍞 Toast notifications using Bootstrap 5
- 💾 PostgreSQL database support (e.g. Supabase)

<br>

## 🧰 Tech Stack

- **Backend**: Flask, SQLAlchemy, Flask-WTF
- **Frontend**: HTML5, Bootstrap 5, Jinja2
- **Database**: PostgreSQL (via Supabase or local setup)
- **API Integration**: TMDb (The Movie Database)

<br>

## 🛠️ Setup Instructions

### 1. Clone the Repository

git clone https://github.com/Mehdix17/My-Top-Movies.git \
cd My-Top-Movies

### 2. Install Dependencies

pip install -r requirements.txt

### 3. Create a .env File

SECRET_KEY=your-secret-key \
DATABASE_URI=postgresql://<user>:<password>@<host>/<db> \
TMDB_API_KEY=your_tmdb_api_key \
TMDB_URL=https://api.themoviedb.org/3/search/movie

⚠️ Use a .env file to keep credentials safe and use python-dotenv to load them.

### 4. Run the App

python index.py \
Then open http://localhost:5000 in your browser.
