from flask import Flask, render_template, redirect, url_for, flash, request
from flask_bootstrap import Bootstrap5
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String, Float
from flask_wtf import FlaskForm
from wtforms.validators import DataRequired, InputRequired, Length, NumberRange
import wtforms as wtf
from datetime import datetime
from dotenv import load_dotenv
import requests, os

# Get absolute path to /templates and /static
base_dir = os.path.dirname(os.path.abspath(__file__))
template_dir = os.path.abspath(os.path.join(base_dir, '../templates'))
static_dir = os.path.abspath(os.path.join(base_dir, '../static'))

# Load environment variables
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_URL = os.getenv("TMDB_URL")
DATABASE_URI = os.getenv("DATABASE_URI")

# Create App
app = Flask(__name__, template_folder=template_dir, static_folder=static_dir, instance_path="/tmp")
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URI
app.config['SECRET_KEY'] = SECRET_KEY
Bootstrap5(app)
current_year = datetime.now().year

# Create DB
class Base(DeclarativeBase):
  pass

db = SQLAlchemy(model_class=Base)
db.init_app(app)

# Create Movie Table
class Movie(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True) 
    title: Mapped[str] = mapped_column(String(250), unique=True) 
    year: Mapped[int] = mapped_column(Integer)
    description : Mapped[str] = mapped_column(String(250))
    rating: Mapped[float] = mapped_column(Float)
    ranking: Mapped[int] = mapped_column(Integer)
    review: Mapped[str] = mapped_column(String(250))
    img_url: Mapped[str] = mapped_column(String(250))


def set_movie(movie, form):
    movie.title = form.title.data
    movie.year = form.year.data
    movie.description = form.description.data
    movie.rating = form.rating.data
    movie.ranking = form.ranking.data
    movie.review = form.review.data
    movie.img_url = form.img_url.data
    db.session.commit()

def add_default_movies():
    db.session.add_all([
        Movie(
            title="The Dark Knight",
            year=2008,
            description="When the menace known as the Joker wreaks havoc...",
            rating=10,
            ranking=1,
            review="Heath Ledger's Joker redefined comic book villains.",
            img_url="static/img/the_dark_knight.jpg"
        ),
        Movie(
            title="Inception",
            year=2010,
            description="A skilled thief is given a chance at redemption...",
            rating=8.5,
            ranking=5,
            review="Mind-bending and visually stunning. A masterpiece.",
            img_url="static/img/inception.jpg"
        ),
        Movie(
            title="Interstellar",
            year=2014,
            description="A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
            rating=9.2,
            ranking=3,
            review="Emotionally powerful and scientifically ambitious.",
            img_url="static/img/interstellar.jpg"
        ),
        Movie(
            title="The Shawshank Redemption",
            year=1994,
            description="Two imprisoned men bond over years, finding solace and redemption through acts of common decency.",
            rating=9.5,
            ranking=2,
            review="A timeless story of hope and humanity.",
            img_url="static/img/the_shawshank_redemption.jpg"
        ),
        Movie(
            title="The Godfather",
            year=1972,
            description="The aging patriarch of an organized crime dynasty transfers control to his reluctant son.",
            rating=9.0,
            ranking=4,
            review="Flawless acting and storytelling. A cinematic legend.",
            img_url="static/img/the_godfather.jpg"
        )
    ])
    db.session.commit()

# Initialise the database (only the first time)
# with app.app_context():
#     db.create_all()
#     add_default_movies()

# Edit Form
class MovieForm(FlaskForm):
    title = wtf.StringField("Movie Title", validators=[DataRequired()])
    year = wtf.IntegerField("Release Year", validators=[DataRequired(), NumberRange(min=1888, max=current_year)])
    description = wtf.TextAreaField("Description", validators=[DataRequired(), Length(max=250)])
    rating = wtf.FloatField("Rating", validators=[InputRequired(), NumberRange(min=0.0, max=10,)])
    ranking = wtf.IntegerField("Ranking", validators=[DataRequired(), NumberRange(min=1)])
    review = wtf.TextAreaField("Review", validators=[DataRequired(), Length(max=70)])
    img_url = wtf.StringField("Image URL", validators=[DataRequired()])
    submit = wtf.SubmitField("Save")


class AddMovieForm(FlaskForm):
    title = wtf.StringField("By his Title", validators=[DataRequired()])
    title_submit = wtf.SubmitField("Search")


@app.route("/")
def home():
    all_movies = db.session.execute(db.select(Movie).order_by(Movie.ranking)).scalars()
    return render_template("index.html", movies=all_movies)


@app.route("/edit/<int:movie_id>", methods=['GET', 'POST'])
def edit(movie_id):
    movie = db.get_or_404(Movie, movie_id)
    form = MovieForm(obj=movie)
    if request.method == "POST":
        if form.validate_on_submit():
            set_movie(movie, form)
            flash("Movie updated successfully", "info")
            return redirect(url_for("home"))
    return render_template("edit.html", form=form, movie=movie)


@app.route("/delete/<int:movie_id>", methods=['GET', 'POST'])
def delete(movie_id):
    movie_to_delete = db.get_or_404(Movie, movie_id)
    db.session.delete(movie_to_delete)
    db.session.commit()
    flash("Movie deleted", "danger")
    return redirect(url_for('home'))


@app.route("/add", methods=['GET', 'POST'])
def add():
    form1 = AddMovieForm()
    form2 = MovieForm()

    if request.method == 'POST':
        if "title_submit" in request.form and form1.validate_on_submit():
            params = {
                "query": form1.title.data,
                "api_key": TMDB_API_KEY,
                "language": "en-US"
            }
            response = requests.get(TMDB_URL, params=params)
            data = response.json()
            results = data.get("results", [])
            if not results:
                flash("Movie Not Found", "danger")
                return redirect(url_for("add"))
            return render_template("select.html", movies=results)

        elif "submit" in request.form and form2.validate_on_submit():
            new_movie = Movie()
            set_movie(new_movie, form2)
            db.session.add(new_movie)
            db.session.commit()
            flash("Movie added successfully", "primary")
            return redirect(url_for("home"))

    return render_template("add.html", form1=form1, form2=form2)


@app.route("/select", methods=['GET', 'POST'])
def select():
    if request.method == "POST":
        new_movie = Movie(
            title = request.form.get("title"),
            year = int(request.form.get("year")),
            description = request.form.get("overview"),
            rating = float(request.form.get("rating")),
            ranking = Movie.query.count() + 1,
            review = "loved it!",
            img_url = request.form.get("img_url")
        )
        db.session.add(new_movie)
        db.session.commit()
        flash("Movie added successfully", "primary")
        return redirect(url_for("home"))


@app.route("/reset")
def reset():
    db.session.query(Movie).delete()
    add_default_movies()
    flash("Movie list has been reset", "success")
    return redirect(url_for("home"))


if __name__ == '__main__':
    app.run(debug=True)
