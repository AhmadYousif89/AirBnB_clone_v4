const $ = window.$;
export const checkedStates = {};
export const checkedCities = {};

function displayCheckedLocations() {
  const checkedNames = [...Object.values(checkedStates), ...Object.values(checkedCities)];
  if (checkedNames.length > 0) {
    $('.filters .locations>.selected')
      .text(checkedNames.join(', '))
      .attr('title', ` Selected: ${checkedNames.join(', ')} `);
  } else {
    $('.filters .locations>.selected').html('&nbsp;').attr('title', '');
  }
  const totalLocations =
    Object.keys(checkedStates).length + Object.keys(checkedCities).length;
  $('.filters .locations .filter-count').text(
    totalLocations <= 99 ? totalLocations : '99+'
  );
}

export function loadCheckedStates() {
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

export function loadCheckedCities() {
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
