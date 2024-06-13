import { loadCheckedStates, loadCheckedCities } from './locations.js';
import { loadCheckedAmenities } from './amenities.js';
import { loadPlaces } from './places.js';

const $ = window.$;
const APIURL = 'http://127.0.0.1:5001/api/v1';

async function checkAPIStatus() {
  const url = `${APIURL}/status`;
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
  loadPlaces(APIURL);
  $('.filters button').click(function () {
    $('.places .wrapper').empty();
    loadPlaces(APIURL);
  });

  $(document).on('click', 'dialog[open]', function (e) {
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
