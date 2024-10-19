
  $(document).ready(function($) {
  "use strict";
  if ($( "#AccessibleNav" ).hasClass('fullwidth_dropdown')) {
	const moveValue = 4;
} else {
  const moveValue = -5;
}
    
    
    $('.menu-item-has-children > a').mouseenter(function(e) {
      var selected = $(this);
      if (selected.next('div.sub-menu-block').hasClass('is-hidden')) {
        selected.addClass('selected').next('div.sub-menu-block').removeClass('is-hidden');
      } else {
        selected.removeClass('selected').next('div.sub-menu-block').addClass('is-hidden');
      }
      e.preventDefault();
    }).mouseleave(function(e) {
      var selected = $(this);
      if (selected.next('div.sub-menu-block').hasClass('is-hidden')) {
        selected.addClass('selected').next('div.sub-menu-block').removeClass('is-hidden');
      } else {
        selected.removeClass('selected').next('div.sub-menu-block').addClass('is-hidden');
      }
      e.preventDefault();
    });

    function megaMenu() {
      if($("#header .page-full-width").length) {
          var parentRow = $("#header .page-full-width > .row");
          var parentLeft = parseInt(parentRow.css("marginLeft").replace('px', ''));
        } else {
          var parentRow = $("#header .page-width .row");
          var parentLeft = parseInt(parentRow.offset().left);
        }
        var parentWidth = parentRow.width();   
  
        $("#header .page-width .dt-nav li:not(.close-nav)").each(function() {
          var thisItem = $(this);
          if(thisItem.hasClass('has-mega-menu')) {
            var thisItemLeft = thisItem.find('a').offset().left;
            var menuLeft = parseInt(thisItemLeft-parentLeft); 
            thisItem.find('.sub-menu-block').css('width', parentWidth);  
            thisItem.find('.sub-menu-block').css('left', -menuLeft);            
          }
        });

    $("sticky-header .dt-nav li:not(.close-nav)").each(function() {
      var thisItem = $(this);
      if(thisItem.hasClass('has-mega-menu')) {
        var thisItemLeft = thisItem.find('a').offset().left;
        var menuLeft = parseInt(thisItemLeft-parentLeft);         

         if ($( "#AccessibleNav").hasClass('fullwidth_dropdown')) { 
      	var menuLeft = menuLeft + 4; 
           var test = "4Full";
          } 
        if ($(".subMenuBlock" ).hasClass('menu-container-width-100')) {          
           var menuLeft = menuLeft + 4; 
           var test = "4Custom";
         }
        
        if ($( "#AccessibleNav").hasClass('default_dropdown')) { 
      	var menuLeft = menuLeft - 5; 
          var test = "5Default";
          } 
        if ($( "#AccessibleNav").hasClass('container_width_dropdown')) { 
      	var menuLeft = menuLeft - 5; 
        var test = "5Container";
          } 
     
        console.log(test);
        thisItem.find('.sub-menu-block').css('width', parentWidth);
        thisItem.find('.sub-menu-block').css('left', -menuLeft);
      }      
    });

    window.setTimeout(function(){
      $(window).trigger('resize');
    }, 800);
  }

  var megaMenuResize = false;
  $(window).bind("resize", function() {
    if(!megaMenuResize) {
      megaMenu();
      megaMenuResize = true;
    }
  });
  megaMenu();
   
});


$(function() {
  if($(window).width() >=  1200) {
     $('.tabs-nav a').click(function() {
    let id = $(this).attr('href');           
    $('.tabs-nav li').removeClass('active');
    $(this).parent().addClass('active');             
    $(this).parent().parent().parent().parent().addClass('active');   
    $('.tabs-content li.dt-sc-menu-tabs').hide();      
    $(this).parent().parent().parent().parent().find(id).show();
   
    return false;
  });
}
  if($(window).width() <= 1199 ) {
  $('.mobileTabs .tabs  li').each(function(){
    $(this).click(function(){
      $(this).next('div').slideToggle(0);
    });
  })
}
});

$(document).ready(function(){
   $('#category-menu-button').click(function() { 
    $(this).toggleClass('open');
    $(".category-wrapper").toggleClass('open');
    $('.category-wrapper').slideToggle(0);
    });
});


window.onscroll = function() {myFunction()};

var header = document.getElementById("Top_Header");
//var sticky = header.offsetTop;
var sticky = 25;
//console.log(sticky);

function myFunction() {
  if (window.pageYOffset > sticky) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
}
