'use-strict'

$('.change-form').on('click', function() {
  $('.hidden-form').addClass('visible-form').removeClass('hidden-form');
  $('.original-form').addClass('hidden-form').removeClass('original-form');
});

$('.change-back').on('click', function() {
  $('.hidden-form').addClass('original-form').removeClass('hidden-form');
  $('.visible-form').addClass('hidden-form').removeClass('visible-form');
})
