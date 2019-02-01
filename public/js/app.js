'use-strict'

$('.change-form').on('click', function() {
  $('.hidden-form').addClass('visible-form').removeClass('hidden-form');
  $('.original-form').addClass('hidden-form').removeClass('original-form');
});

$('.change-back').on('click', function() {
  $('.hidden-form').addClass('original-form').removeClass('hidden-form');
  $('.visible-form').addClass('hidden-form').removeClass('visible-form');
})

$('.expand-two').click(function(){
  if ($('.content-two').is(':empty')) {
    $('#no-traffic').slideToggle('slow');
    $('.hidden-traffic').removeClass('hidden-traffic');
  } else {
    $('.content-two').slideToggle('slow');
    let text = $('.expand-btn-plus-2').text();
    $('.expand-btn-plus-2').text(
      text ==='+' ? '-' : '+');
  }
});


$('.expand-one').click(function(){
  $('.content-one').slideToggle('slow');
  let text = $('.expand-btn-plus-1').text();
  $('.expand-btn-plus-1').text(
    text ==='+' ? '-' : '+');
});

$('.expand-weather').click(function(){
  $('.content-weather').slideToggle('slow');
  let text = $('.expand-btn-plus-weather').text();
  $('.expand-btn-plus-weather').text(
    text ==='+' ? '-' : '+');
});
