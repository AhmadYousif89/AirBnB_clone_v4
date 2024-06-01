const $ = window.$;

$(function () {
  $('.filters .amenities').append('<small class="selected"></small>');
  // Call the function when the page loads
  loadCheckedAmenities();
  // Call the function when the checkbox changes
  $('input[type="checkbox"]').change(loadCheckedAmenities);
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
