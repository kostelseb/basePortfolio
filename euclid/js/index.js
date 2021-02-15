window.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".burger").addEventListener("click", function () {
        document.querySelectorAll(".header__item-off").forEach(function (element) {
            element.classList.toggle("header__item-on")
        })
    })
    var mySwiper = new Swiper('.swiper-container', {
        // Optional parameters
        loop: true,

        // If we need pagination
        pagination: {
            el: '.swiper-pagination',
            clickable: 'true'
        },

        // Navigation arrows
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        // And if we need scrollbar
        scrollbar: {
            el: '.swiper-scrollbar',
        },
    })
    $(function () {
        $("#accordion").accordion({
            collapsible: true,
            heightStyle: "content",
            active: false,

        });
    });

    document.querySelector(".ui-accordion .FAQ__item-header-last ").addEventListener("click", function () {
        document.querySelector(".ui-accordion .FAQ__item-header-last").classList.toggle("FAQ__item-header-last-off")

    })
 
    $(function(){
        $(".FAQ__item-header").click(function(){
          $(this).toggleClass("active");
          if($(this).hasClass("active"))
            $(".FAQ__item-header").not(this).removeClass("active");
        })
      })
    // document.querySelectorAll('.ui-accordion .FAQ__item-header').forEach(function (el) {
    //     el.addEventListener('click', function (e) {
    //         document.querySelectorAll('.FAQ__item-header').forEach(function (element) {
    //             element.classList.remove("active");
    //         })
    //         document.querySelectorAll('.FAQ__item-description').forEach(function (element) {
    //             element.classList.remove("active");
    //         })
    //         document.querySelectorAll('.FAQ__item-image-button').forEach(function (element) {
    //             element.classList.remove("active");
    //         })   
    //         if ( e.target.classList.contains('FAQ__item-header')|| e.target.classList.contains('FAQ__item-description') || e.target.classList.contains('FAQ__item-image-button')) {
    //             e.target.classList.toggle("active");
    //         }
    //     })
    // })
})
