'use-strict'

$('.change-form').on('click', function() {
  $('.hidden-form').addClass('visible-form').removeClass('hidden-form');
  $('.original-form').addClass('hidden-form').removeClass('original-form');
});

$('.change-back').on('click', function() {
  $('.hidden-form').addClass('original-form').removeClass('hidden-form');
  $('.visible-form').addClass('hidden-form').removeClass('visible-form');
})

$('#expand-one-btn').click(function(){
  $('.content-one').slideToggle('slow');
  let text = $('.expand-btn-plus-2').text();
  $('.expand-btn-plus-2').text(
    text ==='+' ? '-' : '+');
});

$('#expand-two-btn').click(function(){
  $('.content-two').slideToggle('slow');
  let text = $('.expand-btn-plus-1').text();
  $('.expand-btn-plus-1').text(
    text ==='+' ? '-' : '+');
});

$('#expand-weather-btn').click(function(){
  $('.content-weather').slideToggle('slow');
  let text = $('.expand-btn-plus-weather').text();
  $('.expand-btn-plus-weather').text(
    text ==='+' ? '-' : '+');
});

$('#expand-event-btn').click(function(){
  $('.content-event').slideToggle('slow');
  let text = $('.expand-btn-plus-event').text();
  $('.expand-btn-plus-event').text(
    text ==='+' ? '-' : '+');
});
