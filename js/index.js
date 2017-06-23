$(document).ready(function(){
  $(".nav-link").on('click', function(event) {
    if (this.hash !== "") {
      event.preventDefault();
      var hash = this.hash;
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 300, function(){
        window.location.hash = hash;
      });
    }
  })

  $("#returnButton").on('click', function(){
    $('html, body').animate({scrollTop: 0}, 300);
  })

  window.onscroll = function(){displayButton()};

  function displayButton() {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
      $("#returnButton").show();
    } else {
      $("#returnButton").hide();
    }

    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
      $(".background-text").fadeOut();
    } else {
      $(".background-text").fadeIn();
    }
  }
});
