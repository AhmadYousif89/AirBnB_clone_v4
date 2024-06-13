const $ = window.$;
export const checkedAmenities = {};

function displayCheckedAmenities() {
  const checkedNames = Object.values(checkedAmenities);
  if (checkedNames.length > 0) {
    $('.filters .amenities>.selected')
      .text(checkedNames.join(', '))
      .attr('title', ` Selected: ${checkedNames.join(', ')} `);
  } else {
    $('.filters .amenities>.selected').html('&nbsp;').attr('title', '');
  }
  const totalAmenities = Object.keys(checkedAmenities).length;
  $('.filters .amenities .filter-count').text(
    totalAmenities <= 99 ? totalAmenities : '99+'
  );
}

export function loadCheckedAmenities() {
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
