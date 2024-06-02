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


idx = 3


@app.route('/{}-hbnb'.format(idx), strict_slashes=False)
def hbnb_filters():
    """Displays a list of all States, Cities and Amenities"""
    states = list(storage.all("State").values())
    amenities = list(storage.all("Amenity").values())
    return render_template(
        '{}-hbnb.html'.format(idx),
        cache_id=uuid4(),
        states=states,
        amenities=amenities,
        js_file_prefix='{}-'.format(idx),
    )


if __name__ == '__main__':
    app.run()
