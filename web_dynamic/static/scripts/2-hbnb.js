const $ = window.$;

$(function () {
  $('.filters .amenities').append('<small class="selected"></small>');
  // Call the function when the page loads
  loadCheckedAmenities();
  // Call the function when the checkbox changes
  $('input[type="checkbox"]').change(loadCheckedAmenities);
  // Check the API status when the page loads
  checkAPIStatus();
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
