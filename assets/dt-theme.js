var Shopify = Shopify || {};
// ---------------------------------------------------------------------------
// Money format handler
// ---------------------------------------------------------------------------
Shopify.money_format = "${{amount}}";
Shopify.formatMoney = function(cents, format) {
  if (typeof cents == 'string') { cents = cents.replace('.',''); }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);

  function defaultOption(opt, def) {
     return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal   = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) { return 0; }

    number = (number/100.0).toFixed(precision);

    var parts   = number.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        cents   = parts[1] ? (decimal + parts[1]) : '';

    return dollars + cents;
  }

  switch(formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
};


if($('#preloader').length > 0) {  
$(window).on('load', function() {
$( "#preloader" ).delay(1000).fadeOut(1000, function() {
if($('.preloader-overflow').length > 0) {
$('body').removeClass('preloader-overflow');   
}
});
});
}
if($('.media-slick-slider  .thumbnail-list').length > 0) {  
$('.thumbnail-list').not('.slick-initialized').slick({
  vertical: true,
  verticalSwiping: true,
  slidesToShow: 4,
  slidesToScroll: 1
});
}




$(window).scroll(function() {    
  if($(window).width() > "1024"){
  if ( $(window).scrollTop() >= 500 ) {
    $('.sticky-bar').css('display', 'flex');
    } else {
    $('.sticky-bar').css('display', 'none');
    }
}});


$(window).scroll(function(){
if($(window).width() < "1024"){
  if ($(window).scrollTop() >= 900) {
        $('.sticky-bar').css('display', 'flex');
    } else {
    $('.sticky-bar').css('display', 'none');        
    }
}
});


$(document).ready(function(){
  $("#recently").click(function(){
    $("#recently-viewed-products").slideToggle(750);
  });
});


var afterInfiniteLoaded = function afterInfiniteLoaded() {   
 $('.loading-image').removeClass('loading-image').addClass('loaded-image');
  }  
if ($('.pagination-method-loadmore_btn').length > 0) {
        var AjaxMethod = 'click';
    } else {
        var AjaxMethod = 'scroll';
    }
if ($('.collection #AjaxinatePagination').length > 0) {
var endlessScroll = new Ajaxinate({
    container: '.AjaxinateContainer',
    pagination: '#AjaxinatePagination',
    method: AjaxMethod,
   offset: 0,
   callback: afterInfiniteLoaded
  
});
}





InitCustomFunctions();
function InitCustomFunctions() { 
if($('.toggleFilter').length > 0) {  
const filter = document.querySelector(".toggleFilter");
const sidebar = document.querySelector(".facets-vertical");  
const closeDiv = document.querySelector(".close-sidebar")  

filter.addEventListener("click", () => {
  filter.classList.toggle("active");
  sidebar.classList.toggle("open");
  $('body').addClass('overflow-hidden');
  $('body').addClass('filter-clicked');
});

closeDiv.addEventListener("click", () => {
  filter.classList.remove("active");
  sidebar.classList.remove("open");
   $('body').removeClass('overflow-hidden');
  $('body').removeClass('filter-clicked');
});
}

//product page color variant to select thumbnail img change color_variants
  if($('.show-grouped__variant').length > 0) {
$('input:radio[name="Color"]').click(function() {
  const cvariant = $(this).val();  
  $('input:radio[name="Color"]').next('.swatch-element').removeClass('clicked');
  $(this).next('.swatch-element').addClass('clicked');
  $('.slick-list').addClass('height_fix');
  $('.thumbnail-list__item').each(function() {
      const variant_val = $(this).find('img').attr("alt");
      if (cvariant == variant_val) {
          $(this).addClass('show');
          $(this).removeClass('hidden');
      } else {
          $(this).addClass('hidden');
          $(this).removeClass('show');
      }
  });
});
  }

  

//     Item swatch trigger start
$(document).on('click', '.color-values a', function() {
    if ($(this).hasClass("active")) {
        $(".color-values a").removeClass("active");
    } else {
        $(".color-values a").removeClass("active");
        $(this).addClass("active");
    }
});

$(document).on('click', '.size-values a', function() {
    if ($(this).hasClass("active")) {
        $(".size-values a").removeClass("active");
        $(this).parents('.products').find('.variant-option-size .size-values').removeClass('active');
    } else {
        $(".size-values a").removeClass("active");
        $(this).addClass("active");
        $(this).parents('.products').find('.variant-option-size .size-values').removeClass('active');
    }
});
$('body').on('click', '.color-values-plus a', function(e) {
    $(this).parents('.variant-option-color').find('.show-on-click').css('display', 'flex');
    $(this).parents('.color-values-plus').css('display', 'none');
    e.preventDefault();
});

  
$('body').on('click', '.swatch-element.color', function () {
  $(this).next('label').find('i');
});
$('body').on('click', '.swatch span', function () {
  var featuredMedia =  $(this).parents('.card-wrapper').find('.card__inner .motion-reduce').attr('srcset', $(this).data("image"));
  $(this).parents('.card-wrapper').find('.card__inner .motion-reduce').attr('srcset', $(this).data("image"));

  if ($(this).parents('.swatch').hasClass('color')) {
    const variant = $(this).data('id');
    // console.log(variant);
    $(this).parents('#product-grid').find('.variant-push').val(variant);

   var swatch_item = $(this).data('variant-item');

    $(this).parents('#product-grid').find('.variant-option-size .size-values').removeClass('active');

    $(this).parents('#product-grid').find('.variant-option-size .swatch').each(function () {

      var swatch_size_vars = $(this).find('span').data('variant-title');
      swatch_size_vars = swatch_size_vars.split('/');
      swatch_size_vars = $.map(swatch_size_vars, $.trim);
      swatch_size_vars = $.map(swatch_size_vars, function (n) {
        return n.toLowerCase();
      });
      swatch_size_vars = $.map(swatch_size_vars, function (n) {
        return n.replace(/ /g, '-');
      });

      if ($.inArray(swatch_item, swatch_size_vars) >= 0) {
        $(this).parent('.size-values').toggleClass('active');
      }
    });
  }

  if ($(this).parents('.swatch').hasClass('size')) {

    var variant = $(this).data('id');
    $(this).parents('#product-grid').find('.variant-push').val(variant);
  }
});


  
//     Item swatch trigger end

  

$(".custom-product-grid li").click(function(){
var classNames = "list-view-filter grid--2-col-desktop grid--3-col-desktop grid--4-col-desktop grid--5-col-desktop grid--6-col-desktop";
var getCols = $(this).data('cols');
$('.custom-product-grid li').removeClass('active');
$(this).addClass("active");
$('ul#product-grid').removeClass(classNames).addClass(getCols);  
});
if($('.filter-buttons').length > 0) {
const viewExists = document.querySelector('.grid-view-button');
if (viewExists.classList.contains('layout-mode')) {
const listViewButton = document.querySelector('.list-view-button');
const gridViewButton = document.querySelector('.grid-view-button');
const list = document.querySelector('ul.view-mode');
const gridviewlist = document.querySelector('.custom-product-grid');

listViewButton.onclick = function () {
listViewButton.classList.add('active');
gridViewButton.classList.remove('active');
list.classList.remove('grid-view-filter');
list.classList.add('list-view-filter');
gridviewlist.classList.add('hidden');
}

gridViewButton.onclick = function () {
listViewButton.classList.remove('active');
gridViewButton.classList.add('active');
list.classList.remove('list-view-filter');
list.classList.add('grid-view-filter');
gridviewlist.classList.remove('hidden');
}

}
}
if($('#swiper-sidebar-carousel').length > 0) {
var swiper = new Swiper("#swiper-sidebar-carousel", {        
  navigation: {
    nextEl: "#swiper-sidebar-next",
    prevEl: "#swiper-sidebar-prev",
  },
});
}
 
setTimeout(function(){
 $('.loading-image').removeClass('loading-image').addClass('loaded-image');   
}, 1000);
}

//FBT ul li select box

$("ul.custom-select").on("click", "li:not(.init)", function() {
  var selectedVal = $(this).data('option-value');  
 // console.log(selectedVal);
  $(this).parents('.fbt-product__meta').find(".selectVariant option").attr("selected",false);
  $(this).parents('.fbt-product__meta').find(".selectVariant option[value="+selectedVal+"]").attr("selected","selected").trigger('change');
}); 

$("ul.custom-select").on("click", ".init", function() {
    $(this).closest("ul.custom-select").children('li:not(.init)').toggle();
});

$("ul.custom-select").on("click", "li:not(.init)", function() {
    $(this).parent().children('li:not(.init)').removeClass('selected');
    $(this).addClass('selected');
    $(this).parent().children('.init').html($(this).html());
    $(this).parent().children('.init').removeClass('li-unselected');
    $(this).parent().children('li:not(.init)').toggle();
    if($('ul.custom-select li.init').hasClass("li-unselected")) {
      $('#add-frequently-bought').prop('disabled', true);
    } else {
      $('#add-frequently-bought').prop('disabled', false);
    }
});
loadedBg();
function loadedBg() {
window.onload=function(){
setTimeout(function(){
 $('.loading-image').removeClass('loading-image').addClass('loaded-image');   
}, 2000);
    }  
}

 jQuery(function () {
  jQuery().on("click", function () {
    jQuery('iframe').contents().find('video').each(function () {
      this.currentTime = 0;
      this.pause();
    });
  });
});


if($('.enquiry-modal').length > 0) {  
const EnquiryModal = document.querySelector(".enquiry-modal");
const EnquiryTrigger = document.querySelector("#trigger-enquiry");
const Enquiryclose = document.querySelector(".enquiry-modal .close-button");

function toggleModal() {
EnquiryModal.classList.toggle("show-enquiry");
document.querySelector("body").classList.toggle('enquiry-overlay');
}
function windowOnClick(event) {
if (event.target === EnquiryModal) {
toggleModal();
}
}

EnquiryTrigger.addEventListener("click", toggleModal);
Enquiryclose.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);
}

document.querySelector(".header-drawer__close").addEventListener('click', closeDrawerMenu);
function closeDrawerMenu() {
 document.querySelector("body").classList.remove('overflow-hidden-tablet');
}



$("#dT_TopStickySearchBtn").click(function(ev) {    
    ev.preventDefault();    
    $("#dT_top-sticky").addClass('search-show');
    $('#dT_top-sticky .search-modal').css('opacity','1');
    $("body").addClass('search-overlay-open');
  });



  $(".dT_TopStickySearchCloseBtn").click(function(ev) {
    ev.preventDefault();
    $("#dT_top-sticky").removeClass('search-show');    
    $('#dT_top-sticky .search-modal').css('opacity','0');
    $("body").removeClass('search-overlay-open');
  });

setTimeout(function(){ 
$('#AccessibleNav .sub-menu-block').show();
}, 1000);