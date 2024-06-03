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
  const totalAmenities = Object.keys(checkedAmenities).length;
  $('.filters .amenities .filter-count').text(
    totalAmenities <= 99 ? totalAmenities : '99+'
  );
}

function loadCheckedAmenities() {
  $('input[name="amenity"]').each(function () {
    if ($(this).is(':checked')) {
      checkedAmenities[$(this).attr('data-id')] = $(this).attr('data-name');
      $(this).prop('checked', true).attr('checked', true);
    }
    $(this).change(function (e) {
      if (e.target === $(this)[0]) {
        if ($(this).is(':checked')) {
          $(this).prop('checked', true).attr('checked', true);
          checkedAmenities[$(this).attr('data-id')] = $(this).attr('data-name');
        } else {
          $(this).prop('checked', false).removeAttr('checked');
          delete checkedAmenities[$(this).attr('data-id')];
        }
      }
      displayCheckedAmenities();
      console.log('checkedAmenities: ', checkedAmenities);
    });
  });
  console.log('Initial checkedAmenities: ', checkedAmenities);
  displayCheckedAmenities();
}

function displayCheckedLocations() {
  const checkedNames = [...Object.values(checkedStates), ...Object.values(checkedCities)];
  if (checkedNames.length > 0) {
    $('.filters .locations>.selected')
      .text(checkedNames.join(', '))
      .attr('title', ` Selected: ${checkedNames.join(', ')} `);
  } else {
    $('.filters .locations>.selected').html('&nbsp;');
  }
  const totalLocations =
    Object.keys(checkedStates).length + Object.keys(checkedCities).length;
  $('.filters .locations .filter-count').text(
    totalLocations <= 99 ? totalLocations : '99+'
  );
}

function loadCheckedStates() {
  $('.state input[name="state"]').each(function () {
    if ($(this).is(':checked')) {
      $(this).prop('checked', true).attr('checked', true);
      checkedStates[$(this).attr('data-id')] = $(this).attr('data-name');
    }
    $(this).change(function (e) {
      const cityCheckboxes = $(this).closest('li').find('.city input[name="city"]');
      if (e.target === $(this)[0]) {
        if ($(this).is(':checked')) {
          $(this).prop('checked', true).attr('checked', true);
          checkedStates[$(this).attr('data-id')] = $(this).attr('data-name');
          cityCheckboxes.each(function () {
            $(this).prop('checked', true).attr('checked', true);
            if (!checkedCities[$(this).attr('data-id')]) {
              checkedCities[$(this).attr('data-id')] = $(this).attr('data-name');
            }
          });
        } else {
          $(this).prop('checked', false).removeAttr('checked');
          delete checkedStates[$(this).attr('data-id')];
          cityCheckboxes.each(function () {
            $(this).prop('checked', false).removeAttr('checked');
            delete checkedCities[$(this).attr('data-id')];
          });
        }
      }
      displayCheckedLocations();
      console.log('checkedStates: ', checkedStates);
      console.log('checkedCities: ', checkedCities);
    });
  });
  console.log('Initial checkedStates: ', checkedStates);
  displayCheckedLocations();
}

function loadCheckedCities() {
  $('.city input[name="city"]').each(function () {
    if ($(this).is(':checked')) {
      checkedCities[$(this).attr('data-id')] = $(this).attr('data-name');
      $(this).prop('checked', true).attr('checked', true);
    }
    $(this).change(function (e) {
      if (e.target === $(this)[0]) {
        const stateCheckbox = $(this).parents('li').find('input[name="state"]');
        if ($(this).is(':checked')) {
          $(this).prop('checked', true).attr('checked', true);
          checkedCities[$(this).attr('data-id')] = $(this).attr('data-name');
          // if all cities are checked, check the state
          const allCitiesChecked =
            $(this).closest('ul').find('.city input[name="city"]').length ===
            $(this).closest('ul').find('.city input[name="city"]:checked').length;
          if (allCitiesChecked) {
            stateCheckbox.prop('checked', true).attr('checked', true);
            checkedStates[stateCheckbox.attr('data-id')] =
              stateCheckbox.attr('data-name');
          }
        } else {
          $(this).prop('checked', false).removeAttr('checked');
          delete checkedCities[$(this).attr('data-id')];
          // if any city is unchecked, uncheck the state
          if (stateCheckbox.is(':checked')) {
            delete checkedStates[stateCheckbox.attr('data-id')];
            stateCheckbox.prop('checked', false).removeAttr('checked');
          }
        }
      }
      displayCheckedLocations();
      console.log('checkedCities: ', checkedCities);
      console.log('checkedStates: ', checkedStates);
    });
  });
  console.log('Initial checkedCities: ', checkedCities);
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
    console.log('Loaded Places: ', places);
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
          <span class="toggle-reviews">show reviews</span>
          <div class="reviews hide">
            <div class="header">
                <span>2</span>
                <h2 class="title">Reviews</h2>
            </div>
            <ul>
            </ul>
          </div>
        </article>`
      );
    }
    $('.toggle-reviews').click(function () {
      // toggleReviews();
      loadReviews();
    });
  });

  res.fail(() => {
    $('.places .wrapper .status').addClass('no-data').text('Failed to load places :/');
    console.log('Failed to load places');
  });
  res.always(() => {
    $('.places .wrapper .status').removeClass('loading');
  });
}

function toggleReviews() {
  if ($('.places article .reviews').is(':visible')) {
    $('.places article .reviews').hide();
  } else {
    $('.places article .reviews').show();
  }
}

function loadReviews() {
  const placeId = $(this).closest('article').attr('data-id');
  const url = `http://127.0.0.1:5001/api/v1/places/${placeId}/reviews`;
  const res = $.get(url);
  res.done(function (reviews) {
    $('.places article .reviews ul').empty();
    let user_name = '';
    for (const review of reviews) {
      console.log('review: ', review);
      const ul = $('.places article .reviews ul');
      ul.append(
        `<li class="review">
          <h3>From ${user_name}</h3>
          <p>${review.text}</p>
        </li>`
      );
    }
  });
  res.fail(() => {
    console.log('Failed to load reviews');
  });
}

$(function () {
  checkAPIStatus();
  ['amenities', 'locations'].forEach(filter => {
    $(`.filters .${filter} h3`).after('<small class="selected"></small>');
    $(`.filters .${filter}`).prepend('<small class="filter-count"></small>');
  });
  loadCheckedAmenities();
  loadCheckedStates();
  loadCheckedCities();
  loadPlaces();
  $('.filters button').click(function () {
    $('.places .wrapper').empty();
    loadPlaces();
  });
});
