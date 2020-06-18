'use strict';

$('form').on('submit', getLocation);

function getLocation(l) {
    l.preventDefault();

    let city = $('city-name').val();
    console.log('you are searching for', city);

    

}