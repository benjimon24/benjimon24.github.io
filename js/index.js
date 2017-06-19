$(document).ready(function(){
  $(".section-link").on('click', function(event) {
    event.preventDefault();
    var hash = this.hash;
    $('html, body').animate({
      scrollTop: $(hash).offset().top
    }, 300, function(){
      window.location.hash = hash;
    });
  })

  $("#returnButton").on('click', function(){
    $('html, body').animate({
      scrollTop: 0
    }, 300);
  })

  window.onscroll = function(){displayButton()};

  function displayButton() {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
      $("#returnButton").show();
    } else {
      $("#returnButton").hide();
    }
  }
});
