const $ = window.$;
const checkedAmenities = {};
const checkedStates = {};
const checkedCities = {};

function checkAPIStatus() {
  const url = 'http://127.0.0.1:5001/api/v1/status';
  $('#api_status').attr('title', 'Checking API status . . . ');
  const res = $.get(url);
  res.done(() => {
    setTimeout(() => {
      $('#api_status').addClass('available').attr('title', 'API Status: online');
    }, 2000);
  });
  res.fail(() => {
    $('#api_status').removeClass('available').attr('title', 'API Status: offline');
  });
}

function displayCheckedAmenities() {
  const checkedNames = Object.values(checkedAmenities);
  if (checkedNames.length > 0) {
    $('.filters .amenities>.selected')
      .text(checkedNames.join(', '))
      .attr('title', ` Selected: ${checkedNames.join(', ')} `);
  } else {
    $('.filters .amenities>.selected').html('&nbsp;');
  }
}

function loadCheckedAmenities() {
  $('input[name="amenity"]').each(function () {
    if ($(this).is(':checked')) {
      checkedAmenities[$(this).attr('data-id')] = $(this).attr('data-name');
      $(this).attr('checked', true);
    } else {
      $(this).attr('checked', false);
      delete checkedAmenities[$(this).attr('data-id')];
    }
  });
  displayCheckedAmenities();
}

function displayCheckedLocations() {
  const checkedStatesNames = Object.values(checkedStates);
  const checkedCitiesNames = Object.values(checkedCities);
  const checkedNames = checkedStatesNames.concat(checkedCitiesNames);
  if (checkedNames.length > 0) {
    $('.filters .locations>.selected')
      .text(checkedNames.join(', '))
      .attr('title', ` Selected: ${checkedNames.join(', ')} `);
  } else {
    $('.filters .locations>.selected').html('&nbsp;');
  }
}

function loadCheckedStates() {
  $('input[name="state"]').each(function () {
    if ($(this).is(':checked')) {
      checkedStates[$(this).attr('data-id')] = $(this).attr('data-name');
      $(this).attr('checked', true);
    } else {
      $(this).attr('checked', false);
      delete checkedStates[$(this).attr('data-id')];
    }
  });
  displayCheckedLocations();
}

function loadCheckedCities() {
  $('input[name="city"]').each(function () {
    if ($(this).is(':checked')) {
      checkedCities[$(this).attr('data-id')] = $(this).attr('data-name');
      $(this).attr('checked', true);
    } else {
      $(this).attr('checked', false);
      delete checkedCities[$(this).attr('data-id')];
    }
  });
  displayCheckedLocations();
}

function loadPlaces() {
  let isLoading = true;
  $('.places .wrapper').append('<p class="status"></p>');
  const url = 'http://127.0.0.1:5001/api/v1/places_search';
  const res = $.ajax({
    url,
    type: 'POST',
    data: JSON.stringify({
      amenities: Object.keys(checkedAmenities),
      states: Object.keys(checkedStates),
      cities: Object.keys(checkedCities)
    }),
    contentType: 'application/json'
  });

  if (isLoading) {
    $('.places .wrapper .status').addClass('loading').text('Loading places . . .');
  }

  res.done(function (places) {
    console.log(places);
    if (places.length === 0) {
      $('.places .wrapper .status').addClass('no-data').text('No places available :/');
    } else {
      $('.places .wrapper .status').removeClass('no-data').text('');
      $('.status').remove();
    }
    for (const place of places) {
      $('.places .wrapper').append(
        `<article data-id="${place.id}">
          <h2 title="${place.name}">${place.name}</h2>
          <div class="price_by_night">
              <span>$${place.price_by_night}</span>
          </div>
          <div class="information">
            <div class="max_guest">
              <img src="../static/images/icon_group.png" alt="icon">
              <span>
                ${place.max_guest} Guest${place.max_guest !== 1 ? 's' : ''}
              </span>
            </div>
            <div class="number_rooms">
              <img src="../static/images/icon_bed.png" alt="icon">
              <span>
                ${place.number_rooms} Bedroom${place.number_rooms !== 1 ? 's' : ''}
              </span>
            </div>
            <div class="number_bathrooms">
              <img src="../static/images/icon_bath.png" alt="icon">
              <span>
                ${place.number_bathrooms} Bathroom${
          place.number_bathrooms !== 1 ? 's' : ''
        }
              </span>
            </div>
          </div>
          <div class="description"><p>${place.description}</p></div>
        </article>`
      );
    }
  });
  res.fail(() => {
    $('.places .wrapper .status').addClass('no-data').text('Failed to load places :/');
    console.log('Failed to load places');
  });
  res.always(() => {
    $('.places .wrapper .status').removeClass('loading');
  });
}

$(function () {
  checkAPIStatus();
  $('.filters .amenities h3').after('<small class="selected"></small>');
  $('.filters .locations h3').after('<small class="selected"></small>');
  loadCheckedAmenities();
  $('input[name="amenity"]').change(loadCheckedAmenities);
  loadCheckedStates();
  $('input[name="state"]').change(loadCheckedStates);
  loadCheckedCities();
  $('input[name="city"]').change(loadCheckedCities);
  loadPlaces();
  $('.filters button').click(function () {
    $('.places .wrapper').empty();
    loadPlaces();
  });
});
