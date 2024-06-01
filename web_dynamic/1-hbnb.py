#!/usr/bin/python3
"""
Script that starts a Flask web application with a route '/1-hbnb/'
"""
import os
from uuid import uuid4
from flask import Flask, render_template
from models import storage

app = Flask(__name__)


def get_image_names():
    """Returns a list of image names without extension"""
    image_dir = os.path.join(os.path.dirname(__file__), 'static', 'images')
    return [
        os.path.splitext(f)[0]
        for f in os.listdir(image_dir)
        if os.path.isfile(os.path.join(image_dir, f))
    ]


@app.teardown_appcontext
def teardown(exception):
    """Closes the current SQLAlchemy Session"""
    storage.close()


idx = 1


@app.route('/{}-hbnb'.format(idx), strict_slashes=False)
def hbnb_filters():
    """Displays a list of all States, Cities and Amenities"""
    states = list(storage.all("State").values())
    places = list(storage.all("Place").values())
    amenities = list(storage.all("Amenity").values())
    return render_template(
        '{}-hbnb.html'.format(idx),
        cache_id=uuid4(),
        states=states,
        places=places[:6],
        amenities=amenities,
        js_file_prefix='{}-'.format(idx),
        image_names=get_image_names(),
    )


if __name__ == '__main__':
    app.run()
