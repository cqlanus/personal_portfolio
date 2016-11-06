$(document).on('click', '[data-toggle="lightbox"]', function(event) {
    event.preventDefault();
    $(this).ekkoLightbox();
});


// Add an inbody class to nav
$('.navbar-fixed-top').on('activate.bs.scrollspy', function(){
  var hash = $(this).find('li.active a').attr('href');
  if(hash !== '#homePage'){
    $('nav').addClass('inBody');
  } else {
    $('nav').removeClass('inBody');
  }
})

$('.navbar [href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//,'') === this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });
