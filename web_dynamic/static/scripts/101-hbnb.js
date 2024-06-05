const $ = window.$;
const checkedAmenities = {};
const checkedStates = {};
const checkedCities = {};
const apiUrl = 'http://127.0.0.1:5001/api/v1';
const imageNames = localImageNames ? localImageNames : [];

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

async function loadPlaces() {
  $('.places .wrapper').append('<p class="status"></p>');
  const url = `${apiUrl}/places_search`;
  try {
    $('.places .wrapper .status').addClass('loading').text('Loading places . . .');
    const places = await $.ajax({
      url,
      type: 'POST',
      data: JSON.stringify({
        amenities: Object.keys(checkedAmenities),
        states: Object.keys(checkedStates),
        cities: Object.keys(checkedCities)
      }),
      contentType: 'application/json'
    });
    console.log('Loaded Places: ', places);
    let placeCount = places.length;
    placeCount = placeCount <= 99 ? placeCount : '99+';
    if (placeCount === 0) {
      $('.places .wrapper .status').addClass('no-data').text('No places available :/');
    } else {
      $('.places .wrapper .status').removeClass('no-data');
      $('.status').remove();
    }
    $('.places .places-count').text(placeCount);

    for (const place of places) {
      $('.places .wrapper').append(
        `<article data-id="${place.id}" class="place">
          <h2 title="${place.name}">${place.name}</h2>
          <div class="price_by_night">
              <span>$${place.price_by_night}</span>
          </div>
          <div class="information">
            <div class="max_guest">
              <img src="../static/images/group.png" alt="icon">
              <span>
                ${place.max_guest} Guest${place.max_guest !== 1 ? 's' : ''}
              </span>
            </div>
            <div class="number_rooms">
              <img src="../static/images/bed.png" alt="icon">
              <span>
                ${place.number_rooms} Bedroom${place.number_rooms !== 1 ? 's' : ''}
              </span>
            </div>
            <div class="number_bathrooms">
              <img src="../static/images/bath.png" alt="icon">
              <span>
                ${place.number_bathrooms} Bathroom${
          place.number_bathrooms !== 1 ? 's' : ''
        }
              </span>
            </div>
          </div>
          <div class="description"><p>${place.description}</p></div>
          <div class="amenities">
            <h3>Amenities</h3>
            <ul>
            </ul>
          </div>
          <button class="toggle-reviews btn">show reviews</button>
          <dialog class="reviews">
            <header>
                <span class="review-counter circle"></span>
                <h3>Reviews</h3>
            </header>
            <ul>
            </ul>
            <button class="close btn">Close</button>
          </dialog>
        </article>`
      );
    }
    const place = $('.places .wrapper .place');
    place.each(function () {
      loadPlaceAmenities($(this), $(this).attr('data-id'));
    });
    place.on('click', '.toggle-reviews', function (e) {
      e.stopPropagation();
      const placeElement = $(this).closest('.place');
      $(this).text('hide reviews');
      placeElement.find('.reviews')[0].showModal();
      loadReviews(placeElement, placeElement.attr('data-id'));
    });
    place.on('click', '.reviews .close', function () {
      $(this).closest('.reviews')[0].close();
      $(this).closest('.place').find('.toggle-reviews').text('show reviews');
    });
  } catch (error) {
    $('.places .places-count').text('❔');
    $('.places .wrapper .status').addClass('no-data').text('Failed to load places :/');
    console.log('Failed to load places');
  } finally {
    $('.places .wrapper .status').removeClass('loading');
  }
}

async function loadPlaceAmenities(placeElement, placeId) {
  const url = `${apiUrl}/places/${placeId}/amenities`;
  const ul = $(placeElement).find('.amenities ul');
  try {
    const amenities = await $.get(url);
    for (const amenity of amenities) {
      if (imageNames.includes(amenity.name)) {
        ul.append(
          `<li class="amenity">
            <img src="../static/images/${amenity.name}.png" alt="${amenity.name} image">
            <span>${amenity.name}</span>
          </li>`
        );
      } else {
        ul.append(
          `<li class="amenity">
            <img src="../static/images/icon.png" alt="default amenity image">
            <span>${amenity.name}</span>
          </li>`
        );
      }
    }
  } catch (error) {
    console.log('Failed to load amenities');
  }
}

async function loadReviews(placeElement, placeId) {
  const url = `${apiUrl}/places/${placeId}/reviews`;
  const ul = $(placeElement).find('.reviews ul');
  ul.empty();
  ul.append('<li class="loading">Loading reviews . . .</li>');

  try {
    const reviews = await $.ajax(url);
    ul.empty();
    let reviewCount = reviews.length;
    reviewCount = reviewCount <= 99 ? reviewCount : '99+';
    if (reviewCount === 0) {
      ul.append('<li class="no-data">No reviews for this place</li>');
    }
    $(placeElement).find('.reviews .review-counter').text(reviewCount);
    for (const review of reviews) {
      const user = await getUser(review.user_id);
      const userName = user ? `${user.first_name} ${user.last_name}` : 'Unknown';
      ul.append(
        `<li class="review">
          <h4>From ${userName}</h4>
          <p>${review.text}</p>
        </li>`
      );
    }
  } catch (error) {
    ul.empty();
    ul.append('<li class="no-data">Failed to load reviews</li>');
    $(placeElement).find('.reviews .review-counter').html('<small>❔</small>');
    console.log('Failed to load reviews');
  }
}

async function getUser(userId) {
  const url = `${apiUrl}/users/${userId}`;
  try {
    const user = await $.get(url);
    return user;
  } catch (error) {
    console.log('Failed to load user');
    return null;
  }
}

async function checkAPIStatus() {
  const url = `${apiUrl}/status`;
  $('#api_status').attr('title', 'Checking API status . . . ');
  try {
    await $.get(url);
    setTimeout(() => {
      $('#api_status').addClass('available').attr('title', 'API Status: online');
    }, 2000);
  } catch (error) {
    console.log('API is not available');
    $('#api_status').removeClass('available').attr('title', 'API Status: offline');
  }
}

$(function () {
  checkAPIStatus();
  ['amenities', 'locations'].forEach(filter => {
    $(`.filters .${filter} h3`).after('<small class="selected"></small>');
    $(`.filters .${filter}`).prepend('<span class="filter-count circle"></span>');
  });
  loadCheckedAmenities();
  loadCheckedStates();
  loadCheckedCities();
  loadPlaces();
  $('.filters button').click(function () {
    $('.places .wrapper').empty();
    loadPlaces();
  });

  $(document).on('click', 'dialog.reviews[open]', function (e) {
    const rect = $(this)[0].getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      $(this)[0].close();
    }
  });
});
