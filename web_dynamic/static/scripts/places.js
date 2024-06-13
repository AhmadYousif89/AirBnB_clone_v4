import { checkedStates, checkedCities } from './locations.js';
import { checkedAmenities } from './amenities.js';
import { loadReviews } from './reviews.js';

const $ = window.$;
const imageNames = localImageNames ? localImageNames : [];

export async function loadPlaces(apiUrl) {
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
            <dialog class="all-amenities">
              <header>
                <span class="amenity-count circle"></span>
                <h2>Amenities</h2>
              </header>
              <ul>
              </ul>
            </dialog>
            <button class="toggle-amenities btn"></button>
          </div>
          <div class="reviews">
            <h3>Reviews</h3>
            <button class="toggle-reviews btn">show all reviews</button>
            <dialog class="all-reviews">
              <header>
                <span class="review-counter circle"></span>
                <h2>Reviews</h2>
              </header>
              <ul>
              </ul>
              <button class="close btn">Close</button>
            </dialog>
          </div>
        </article>`
      );
    }
    const place = $('.places .wrapper .place');
    place.each(function () {
      loadPlaceAmenities(apiUrl, $(this), $(this).attr('data-id'));
    });
    place.on('click', '.toggle-amenities', function () {
      const placeElement = $(this).closest('.place');
      placeElement.find('dialog.all-amenities')[0].showModal();
      loadPlaceAmenities(
        apiUrl,
        placeElement,
        placeElement.attr('data-id'),
        'dialog.all-amenities'
      );
    });
    place.on('click', '.toggle-reviews', function () {
      const placeElement = $(this).closest('.place');
      $(this).next('dialog.all-reviews')[0].showModal();
      $(this).next('dialog.all-reviews').focus();
      loadReviews(apiUrl, placeElement, placeElement.attr('data-id'));
    });
    place.on('click', '.close', function () {
      $(this).closest('dialog')[0].close();
    });
  } catch (error) {
    $('.places .places-count').text('❔');
    $('.places .wrapper .status').addClass('no-data').text('Failed to load places :/');
    console.log('Failed to load places');
  } finally {
    $('.places .wrapper .status').removeClass('loading');
  }
}

async function loadPlaceAmenities(apiUrl, placeElement, placeId, target = '') {
  const url = `${apiUrl}/places/${placeId}/amenities`;
  const ul =
    target !== 'dialog.all-amenities'
      ? $(placeElement)
          .find('.amenities')
          .prepend(`<h3>Amenities</h3><ul></ul>`)
          .find('ul')
          .first()
      : $(placeElement).find('.amenities ' + target + ' ul');
  ul.empty();
  ul.append('<li class="loading">Loading amenities . . .</li>');
  try {
    const amenities = await $.get(url);
    ul.empty();
    let amenityCount = amenities.length;
    amenityCount = amenityCount <= 99 ? amenityCount : '99+';
    $(placeElement).find('.amenities .amenity-count').text(amenityCount);
    $(placeElement)
      .find('.amenities .toggle-amenities')
      .text(`show all ${amenityCount} amenity`);
    if (amenityCount === 0) {
      ul.append('<li class="no-data">No amenities for this place</li>');
      $(placeElement).find('.amenities .toggle-amenities').hide();
    }

    const amenityList =
      target === 'dialog.all-amenities' ? amenities : amenities.slice(0, 6);
    for (const amenity of amenityList) {
      const amenityName = amenity.name.toLowerCase();
      if (imageNames.includes(amenityName)) {
        ul.append(
          `<li class="amenity">
            <svg class="" width="24" height="24">
              <use xlink:href="../static/images/amenities.svg#${amenityName}"></use>
            </svg>
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
    ul.empty();
    ul.append('<li class="no-data">Failed to load amenities :/</li>');
    $(placeElement).find('.amenities .amenity-count').html('<small>❔</small>');
    console.log('Failed to load amenities');
  }
}
