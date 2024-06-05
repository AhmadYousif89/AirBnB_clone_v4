#!/usr/bin/python3
"""
Script that starts a Flask web application with a route '/2-hbnb/'
"""
import os
from uuid import uuid4
from flask import Flask, render_template
from models import storage

app = Flask(__name__)


@app.teardown_appcontext
def teardown(exception):
    """Closes the current SQLAlchemy Session"""
    storage.close()


def get_image_names():
    """Returns a list of image names without extension"""
    image_dir = os.path.join(os.path.dirname(__file__), 'static', 'images')
    return [
        os.path.splitext(f)[0]
        for f in os.listdir(image_dir)
        if os.path.isfile(os.path.join(image_dir, f))
    ]


idx = 101


@app.route('/{}-hbnb'.format(idx), strict_slashes=False)
def hbnb():
    """Displays a list of all States, Cities and Amenities"""
    states = list(storage.all("State").values())
    amenities = list(storage.all("Amenity").values())
    return render_template(
        '{}-hbnb.html'.format(idx),
        cache_id=uuid4(),
        states=states,
        amenities=amenities,
        image_names=get_image_names(),
        js_file_prefix='{}-'.format(idx),
    )


if __name__ == '__main__':
    app.run()
