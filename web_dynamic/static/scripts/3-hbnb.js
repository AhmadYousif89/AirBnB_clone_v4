const $ = window.$;

$(function () {
  checkAPIStatus();
  $('.filters .amenities').append('<small class="selected"></small>');
  loadCheckedAmenities();
  $('input[type="checkbox"]').change(loadCheckedAmenities);
  loadPlaces();
});

function loadCheckedAmenities() {
  const checkedAmenities = {};
  $('input[type="checkbox"]').each(function () {
    if ($(this).is(':checked')) {
      checkedAmenities[$(this).attr('data-id')] = $(this).attr('data-name');
    }
  });
  if (Object.values(checkedAmenities).length > 0) {
    $('.filters .amenities>.selected').text(Object.values(checkedAmenities).join(', '));
    $('.filters .amenities>.selected').attr(
      'title',
      `Selected : ${Object.values(checkedAmenities).join(', ')}`
    );
  } else {
    $('.filters .amenities>.selected').html('&nbsp;');
  }
}

function checkAPIStatus() {
  const url = 'http://127.0.0.1:5001/api/v1/status';
  $('#api_status').attr('title', ' Checking API status . . . ');
  const res = $.get(url);
  res.done(() => {
    setTimeout(() => {
      $('#api_status').addClass('available');
      $('#api_status').attr('title', ' API Status : online ');
    }, 2000);
  });
  res.fail(() => {
    $('#api_status').removeClass('available');
    $('#api_status').attr('title', ' API Status : offline ');
  });
}

function loadPlaces() {
  const url = 'http://127.0.0.1:5001/api/v1/places_search';
  const res = $.ajax({
    url,
    type: 'POST',
    data: JSON.stringify({}),
    contentType: 'application/json'
  });
  res.done(function (places) {
    console.log(places);
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
                ${place.number_bathrooms} Bedroom${
          place.number_bathrooms !== 1 ? 's' : ''
        }</span>
            </div>
          </div>
          <div class="description"><p>${place.description}</p></div>
        </article>`
      );
    }
  });
  res.fail(() => {
    console.log('Failed to load places');
  });
}
