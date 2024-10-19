function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));

  if(summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch(e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
    const IncValue = this.input.value;
    var priceElement =  document.querySelector('.product__info-container');
    var currentPrice =  priceElement.querySelector('.product-price-current');   
    const priceData = currentPrice.dataset.price;   
    var SubPrice = priceData.replace(/[^0-9\.]/g, '');   
    var ReultPrice =  SubPrice.replace(/^(\.+)/g, '');     
    var EvalPrice = parseInt(ReultPrice)    
    var subtotal = (IncValue * EvalPrice);                   
    var subtotalElement =  document.getElementById('subtotal-value');    
    subtotalElement.innerText = Shopify.formatMoney(subtotal+'.00', DT_THEME.moneyFormat);
     
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach((summary) =>
      summary.addEventListener('click', this.onSummaryClick.bind(this))
    );
    this.querySelectorAll('button:not(.localization-selector)').forEach((button) =>
      button.addEventListener('click', this.onCloseButtonClick.bind(this))
    );
    
  }

  onKeyUp(event) {
    if (event.code.toUpperCase() !== 'ESCAPE') return;
    const openDetailsElement = event.target.closest('details[open]');
    if (!openDetailsElement) return;
    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    var topBarHeight = document.getElementById('shopify-section-top-bar').offsetHeight;    
    document.getElementById("menu-drawer").style.top = '-'+topBarHeight+"px";    
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }

    if (detailsElement === this.mainDetailsToggle) {
      if (isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);

      if (window.matchMedia('(max-width: 990px)')) {
        document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
      }
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        parentMenuElement && parentMenuElement.classList.add('submenu-open');
        !reducedMotion || reducedMotion.matches
          ? addTrapFocus()
          : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;

    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.querySelectorAll('details').forEach((details) => {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    this.mainDetailsToggle.querySelectorAll('.submenu-open').forEach((submenu) => {
      submenu.classList.remove('submenu-open');
    });
    document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);

    if (event instanceof KeyboardEvent) elementToFocus?.setAttribute('aria-expanded', false);
  }

  onFocusOut() {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement))
        this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    const parentMenuElement = detailsElement.closest('.submenu-open');
    parentMenuElement && parentMenuElement.classList.remove('submenu-open');
    detailsElement.classList.remove('menu-opening');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus(detailsElement.querySelector('summary'));
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    };

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.querySelector('.section-header');
    this.borderOffset =
      this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
    this.header.classList.add('menu-open');

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    window.addEventListener('resize', this.onResize);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus) {
    if (!elementToFocus) return;    
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('menu-open');
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    this.header &&
      document.documentElement.style.setProperty(
        '--header-bottom-position',
        `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`
      );
    document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
  };
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this, false)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    document.body.dispatchEvent(new CustomEvent('modalClosed'));
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[id^="Slider-"]');
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.enableSliderLooping = false;
    this.currentPageElement = this.querySelector('.slider-counter--current');
    this.pageTotalElement = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');

    if (!this.slider || !this.nextButton) return;

    this.initPages();
    const resizeObserver = new ResizeObserver(entries => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener('scroll', this.update.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
    
    this.sliderControlWrapper = this.querySelector('.slider-buttons');

    if (!this.sliderControlWrapper) return;
    this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide');

    
    this.sliderControlLinksArray = Array.from(this.sliderControlWrapper.querySelectorAll('.slider-counter__link'));
    this.sliderControlLinksArray.forEach(link => link.addEventListener('click', this.linkToSlide.bind(this)));
  }

  initPages() {
    this.sliderItemsToShow = Array.from(this.sliderItems).filter(element => element.clientWidth > 0);
    if (this.sliderItemsToShow.length < 2) return;
    this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft;
    this.slidesPerPage = Math.floor(this.slider.clientWidth / this.sliderItemOffset);
    this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1;
    this.update();
  }

  resetPages() {
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.initPages();
  }

  update() {
    const previousPage = this.currentPage;
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1;

    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage;
      this.pageTotalElement.textContent = this.totalPages;
    }

    if (this.currentPage != previousPage) {
      this.dispatchEvent(new CustomEvent('slideChanged', { detail: {
        currentPage: this.currentPage,
        currentElement: this.sliderItemsToShow[this.currentPage - 1]
      }}));
    }

    if (this.enableSliderLooping) return;

    if (this.isSlideVisible(this.sliderItemsToShow[0])) {
      this.prevButton.setAttribute('disabled', 'disabled');
    } else {
      this.prevButton.removeAttribute('disabled');
    }

    if (this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])) {
      this.nextButton.setAttribute('disabled', 'disabled');
    } else {
      this.nextButton.removeAttribute('disabled');
    }
    
    
    this.sliderControlButtons = this.querySelectorAll('.slider-counter__link');
    this.prevButton.removeAttribute('disabled');

    if (!this.sliderControlButtons.length) return;

    this.sliderControlButtons.forEach(link => {
      link.classList.remove('slider-counter__link--active');
      link.removeAttribute('aria-current');
    });
    this.sliderControlButtons[this.currentPage - 1].classList.add('slider-counter__link--active');
    this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', true);
    
  }

  isSlideVisible(element, offset = 0) {
    const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
    return (element.offsetLeft + element.clientWidth) <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
  }

  onButtonClick(event) {
    event.preventDefault();
    const step = event.currentTarget.dataset.step || 1;
    this.slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + (step * this.sliderItemOffset) : this.slider.scrollLeft - (step * this.sliderItemOffset);
    this.slider.scrollTo({
      left: this.slideScrollPosition
    });
  }
  
  linkToSlide(event) {
    event.preventDefault();
    const slideScrollPosition = this.slider.scrollLeft + this.slider.clientWidth * (this.sliderControlLinksArray.indexOf(event.currentTarget) + 1 - this.currentPage);
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }
}

customElements.define('slider-component', SliderComponent);

class SlideshowComponent extends SliderComponent {
  constructor() {
    super();
    this.slider = this.querySelector('[data-slider-options]');
    this.init();
  }

  init() {
    const predefine = {
      effect: 'slide',
      direction: 'horizontal',
      autoplay: true,
      autoplaySpeed: 5,
      space: 30,
      center: true,
      options: {},
    };    
    const slider_options = this.slider.getAttribute('data-slider-options');
    if (slider_options === null || slider_options === '') {
      return null;
    }
    const grouping = $.extend(true, predefine, JSON.parse(slider_options));
    
    const isNumberic = /^\d+$/;
    Object.keys(grouping).forEach((key) => {
      if (typeof grouping[key] === 'string' && isNumberic.test(grouping[key])) {
        grouping[key] = parseInt(grouping[key], 10);
      }
    });
    let autoplay = false;
    if (grouping.auto_play > 0) {
      autoplay = {
        delay: grouping.auto_play * 1000,
      };
    }
    let loop = false;
    if (grouping.loop === 'true' || grouping.loop === true) {
      loop = true;
    }
    const option = $.extend(true, {
      init: false,
      spaceBetween: 30,
      loop,
      autoplay,
      navigation: {
        nextEl: this.slider.querySelector('.swiper-button-next'),
        prevEl: this.slider.querySelector('.swiper-button-prev'),
      },
      pagination: {
        el: this.slider.querySelector('.swiper-pagination'),
        clickable: true,
      },
      lazy: true,
      effect: grouping.effect,
    }, grouping.options);
    const container = this.slider.querySelector('[data-swiper-slider]');
    const initiate = new Swiper(container, option);
    initiate.on('init', () => {
    initiate.update();
    });
    initiate.init();
  }
}

customElements.define('slideshow-component', SlideshowComponent);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.updateInventoryStatus();
    this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGallery = document.getElementById(`MediaGallery-${this.dataset.section}`);
    mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true);

    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    if (!modalContent) return;
    const newMediaModal = modalContent.querySelector( `[data-media-id="${this.currentVariant.featured_media.id}"]`);
    modalContent.prepend(newMediaModal);
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton || !shareButton.updateUrl) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }


  updatePickupAvailability() {     
  const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;
    if (this.currentVariant && this.currentVariant.available) {   
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }
updateInventoryStatus() {
    const inventoryNote = document.querySelector('.inventoryNote');
   if (!inventoryNote) return;
    const inventoryVisibility = document.querySelector('.inventory-form__label');
    if (this.currentVariant && this.currentVariant.available) {
      const inventoryHtml = `${variantStock[this.currentVariant.id]}`;     
      inventoryVisibility.classList.remove('visibility-hidden');
      inventoryNote.textContent = inventoryHtml;
 
    } else {
      inventoryNote.innerHTML = "";
      inventoryVisibility.classList.add('visibility-hidden');
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const qty = document.getElementById(`Quantity-template-${this.dataset.section}`);
        const destination = document.getElementById(`price-${this.dataset.section}`);
        const source = html.getElementById(`price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
        if (source && destination) destination.innerHTML = source.innerHTML;
        const skuSource = html.getElementById(`Sku-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
        const skuDestination = document.getElementById(`Sku-${this.dataset.section}`);
        if (skuSource && skuDestination) {
          skuDestination.innerHTML = skuSource.innerHTML;
          skuDestination.classList.toggle('visibility-hidden', skuSource.classList.contains('visibility-hidden'));
        }
        const price = document.getElementById(`price-${this.dataset.section}`);
       // if (price) price.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);

        const subTotal = document.getElementById(`subtotal-${this.dataset.section}`);
        const destination2 = document.getElementById(`subtotal-${this.dataset.section}`);
        const source2 = html.getElementById(`subtotal-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
        if (source2 && destination2) destination2.innerHTML = source2.innerHTML;
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
     const stickButton = document.getElementById('sticky-bar-button');
    
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
   
    
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;
    
    
    if (disable) {
      addButton.setAttribute('disabled', 'disabled');    
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');      
      addButtonText.textContent = window.variantStrings.addToCart;
    }

     if (!stickButton) return;    
    if (disable) {      
      stickButton.setAttribute('disabled', 'disabled');      
    } else {      
      stickButton.removeAttribute('disabled');      
    }
    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const sku = document.getElementById(`Sku-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);    
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;        
    if (sku) sku.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);
class SwiperSlider extends HTMLElement {
    constructor() {
        super(), this.slider = this.querySelector("[data-slider-options]"), this.init()
    }
    init() {
        const e = this.slider.getAttribute("data-slider-options");
        if (null === e || "" === e) return null;
        const t = $.extend(!0, {
                effect: "slide",
                direction: "horizontal",
                autoplay: !0,
                autoplaySpeed: 5,
                space: 30,
                center: !0,
                options: {}
            }, JSON.parse(e)),
            i = /^\d+$/;
        Object.keys(t).forEach((e => {
            "string" == typeof t[e] && i.test(t[e]) && (t[e] = parseInt(t[e], 10))
        }));
        let s = !1;
        t.auto_play > 0 && (s = {
            delay: 1e3 * t.auto_play
        });
        let l = !1,
            r = !1;
        "true" === t.loop || !0 === t.loop ? l = !0 : 1 === t.loop ? (l = !0, r = !0) : (r = !1, l = !1);
        const o = $.extend(!0, {
                init: !1,
                spaceBetween: 30,
                loop: l,
                preventClicks: true,
          preventClicksPropagation: true,
                autoplay: s,
                centeredSlides: r,
                navigation: {
                    nextEl: this.slider.querySelector(".swiper-button-next"),
                    prevEl: this.slider.querySelector(".swiper-button-prev")
                },
                pagination: {
                    el: this.slider.querySelector(".swiper-pagination"),
                    clickable: !0
                },
                lazy: !0,
                focusableElements: 'input, select, option, textarea, video, label',
                breakpoints: {
                    320: {
                        slidesPerView: t.mobile,
                        slidesPerColumn: 1
                    },
                    560: {
                        slidesPerView: t.tablet,
                        slidesPerColumn: 1
                    },
                    992: {
                        slidesPerView: t.desktop,
                        slidesPerColumn: 1
                    }
                }
            }, t.options),
            n = this.slider.querySelector("[data-swiper-slider]"),
            a = new Swiper(n, o);
        a.on("init", (() => {
            a.update()
        })), a.init()
    }
}
customElements.define('swiper-slider', SwiperSlider);

class FeaturedSwiperSlider extends HTMLElement {
    constructor() {
        super(), this.slider = this.querySelector("[data-slider-options]"), this.init()
    }
    init() {
        const e = this.slider.getAttribute("data-slider-options");
        if (null === e || "" === e) return null;
        const t = $.extend(!0, {
                effect: "slide",
                direction: "horizontal",
                autoplay: !0,
                autoplaySpeed: 5,
                space: 30,
                center: !0,
                options: {}
            }, JSON.parse(e)),
            i = /^\d+$/;
        Object.keys(t).forEach((e => {
            "string" == typeof t[e] && i.test(t[e]) && (t[e] = parseInt(t[e], 10))
        }));
        let s = !1;
        t.auto_play > 0 && (s = {
            delay: 1e3 * t.auto_play
        });
        let l = !1,
            r = !1;
        "true" === t.loop || !0 === t.loop ? l = !0 : 1 === t.loop ? (l = !0, r = !0) : (r = !1, l = !1);
        const o = $.extend(!0, {
                init: !1,
                spaceBetween: 30,
                loop: l,
                autoplay: s,
                preventClicks: true,
                preventClicksPropagation: true,
                centeredSlides: r,
                navigation: {
                    nextEl: this.slider.querySelector(".swiper-button-next"),
                    prevEl: this.slider.querySelector(".swiper-button-prev")
                },
                pagination: {
                    el: this.slider.querySelector(".swiper-pagination"),
                    clickable: !0
                },
                lazy: !0,
                focusableElements: 'input, select, option, textarea, video, label',
                breakpoints: {
                    320: {
                        slidesPerView: t.mobile,
                        slidesPerColumn: 1
                    },
                    390: {
                        slidesPerView: t.tablet,
                        slidesPerColumn: 1
                    },
                    781: {
                        slidesPerView: t.laptop,
                        slidesPerColumn: 1
                    },
                    1200: {
                        slidesPerView: t.desktop,
                        slidesPerColumn: 1
                    }
                }
            }, t.options),
            n = this.slider.querySelector("[data-swiper-slider]"),
            a = new Swiper(n, o);
        a.on("init", (() => {
            a.update()
        })), a.init()
    }
}
customElements.define('featured-swiper-slider', FeaturedSwiperSlider);

/*collection-list*/
class CollectionSlider extends HTMLElement {
    constructor() {
        super(), this.slider = this.querySelector("[data-slider-options]"), this.init()
    }
    init() {
        let e = this.slider.getAttribute("data-slider-options");
        if (null === e || "" === e) return null;
        let i = $.extend(!0, {
                direction: "horizontal",
                autoplay: !0,
                autoplaySpeed: 5,
                space: 30,
                center: !0,
                options: {}
            }, JSON.parse(e)),
            t = /^\d+$/;
        Object.keys(i).forEach(e => {
            "string" == typeof i[e] && t.test(i[e]) && (i[e] = parseInt(i[e], 10))
        });
        let s = !1;
        i.auto_play > 0 && (s = {
            delay: 1e3 * i.auto_play
        });
        let l = !1,
            o = !1;
        "true" === i.loop || !0 === i.loop ? l = !0 : 1 === i.loop ? (l = !0, o = !0) : (o = !1, l = !1);
        let n = $.extend(!0, {
                init: !1,
                loop: l,
                autoplay: s,
                centeredSlides: o,
                effect: "coverflow",
                spaceBetween: 0,
                coverflowEffect: {
                    rotate: 0,
                    stretch: 0,
                    depth: 300,
                    modifier: 1,
                    slideShadows: !0
                },
                navigation: {
                    nextEl: this.slider.querySelector(".swiper-button-next"),
                    prevEl: this.slider.querySelector(".swiper-button-prev")
                },
                pagination: {
                    el: this.slider.querySelector(".swiper-pagination"),
                    clickable: !0
                },
                lazy: !0,
                focusableElements: 'input, select, option, textarea, video, label',
                breakpoints: {
                    320: {
                        slidesPerView: i.mobile,
                        slidesPerColumn: 1
                    },
                    560: {
                        slidesPerView: i.tablet,
                        slidesPerColumn: 1
                    },
                    768: {
                        slidesPerView: i.desktop,
                        slidesPerColumn: 1
                    },
                    992: {
                        slidesPerView: i.desktop,
                        slidesPerColumn: 1
                    }
                }
            }, i.options),
            r = this.slider.querySelector("[data-collection-slider]"),
            a = new Swiper(r, n);
        a.on("init", () => {
            a.update()
        }), a.init()
    }
}
customElements.define("collection-slider", CollectionSlider);

class CollectionSwiperSlider extends HTMLElement {
    constructor() {
        super(), this.slider = this.querySelector("[data-slider-options]"), this.init()
    }
    init() {
        const e = this.slider.getAttribute("data-slider-options");
        if (null === e || "" === e) return null;
        const t = $.extend(!0, {
                effect: "slide",
                direction: "horizontal",
                autoplay: !0,
                autoplaySpeed: 5,
                space: 30,
                center: !0,
                options: {}
            }, JSON.parse(e)),
            i = /^\d+$/;
        Object.keys(t).forEach((e => {
            "string" == typeof t[e] && i.test(t[e]) && (t[e] = parseInt(t[e], 10))
        }));
        let l = !1;
        t.auto_play > 0 && (l = {
            delay: 1e3 * t.auto_play
        });
        let s = !1,
            o = !1;
        "true" === t.loop || !0 === t.loop ? s = !0 : 1 === t.loop ? (s = !0, o = !0) : (o = !1, s = !1);
        const r = $.extend(!0, {
                init: !1,
                spaceBetween: 30,
                loop: s,
                autoplay: l,
                centeredSlides: o,
                navigation: {
                    nextEl: this.slider.querySelector(".swiper-button-next"),
                    prevEl: this.slider.querySelector(".swiper-button-prev")
                },
                pagination: {
                    el: this.slider.querySelector(".swiper-pagination"),
                    clickable: !0
                },
                lazy: !0,
          focusableElements: 'input, select, option, textarea, video, label',
                breakpoints: {
                    320: {
                        slidesPerView: t.mobile,
                        slidesPerColumn: 1
                    },
                    570: {
                        slidesPerView: t.tablet,
                        slidesPerColumn: 1
                    },
                    990: {
                        slidesPerView: t.laptop,
                        slidesPerColumn: 1
                    },
                    1200: {
                        slidesPerView: t.desktop,
                        slidesPerColumn: 1
                    }
                }
            }, t.options),
            n = this.slider.querySelector("[data-swiper-slider]"),
            p = new Swiper(n, r);
        p.on("init", (() => {
            p.update()
        })), p.init()
    }
}
customElements.define("collection-swiper-slider", CollectionSwiperSlider);
class Accordion {
    constructor(i) {
        this.el = i, this.summary = i.querySelector("summary"), this.content = i.querySelector(".accordion__content"), this.animation = null, this.isClosing = !1, this.isExpanding = !1, this.summary.addEventListener("click", (i => this.onClick(i)))
    }
    onClick(i) {
        i.preventDefault(), this.el.style.overflow = "hidden", this.isClosing || !this.el.open ? this.open() : (this.isExpanding || this.el.open) && this.shrink()
    }
    shrink() {
        this.isClosing = !0;
        const i = `${this.el.offsetHeight}px`,
            t = `${this.summary.offsetHeight}px`;
        this.animation && this.animation.cancel(), this.animation = this.el.animate({
            height: [i, t]
        }, {
            duration: 400,
            easing: "ease-out"
        }), this.animation.onfinish = () => this.onAnimationFinish(!1), this.animation.oncancel = () => this.isClosing = !1
    }
    open() {
        this.el.style.height = `${this.el.offsetHeight}px`, this.el.open = !0, window.requestAnimationFrame((() => this.expand()))
    }
    expand() {
        this.isExpanding = !0;
        const i = `${this.el.offsetHeight}px`,
            t = `${this.summary.offsetHeight+this.content.offsetHeight}px`;
        this.animation && this.animation.cancel(), this.animation = this.el.animate({
            height: [i, t]
        }, {
            duration: 400,
            easing: "ease-out"
        }), this.animation.onfinish = () => this.onAnimationFinish(!0), this.animation.oncancel = () => this.isExpanding = !1
    }
    onAnimationFinish(i) {
        this.el.open = i, this.animation = null, this.isClosing = !1, this.isExpanding = !1, this.el.style.height = this.el.style.overflow = ""
    }
}
document.querySelectorAll(".dt-details").forEach((i => {
    new Accordion(i)
}));
$("#accordian li").click((function() {
    var e = $(this),
        o = e.closest("ul"),
        t = o.find(".active"),
        i = e.closest("li"),
        l = i.hasClass("active"),
        s = 0;
    o.find("ul").slideUp((function() {
        ++s == o.find("ul").length && t.removeClass("active")
    })), l || (i.children("ul").slideDown(), i.addClass("active"))
})), $(window).width() < 767 && ($(".footer_menu").length > 0 && ($(".footer_menu").hide(), $(".footer-links").each((function() {
    $(this).find(".footer__title").click((function() {
        $(this).toggleClass("open"), $(this).next("ul").slideToggle("slow")
    }))
}))), $(".footer_newsletter").length > 0 && ($(".footer-block__newsletter").hide(), $(".footer_newsletter").each((function() {
    $(this).find(".footer-block__heading").click((function() {
        $(this).toggleClass("open"), $(".footer-block__newsletter").slideToggle("slow")
    }))
}))), $(".footer_address").length > 0 && ($(".footer--address").hide(), $(".footer_address").each((function() {
    $(this).find(".footer-block__heading").click((function() {
        $(this).toggleClass("open"), $(".footer--address").slideToggle("slow")
    }))
}))));

class InstaSlider extends HTMLElement {
    constructor() {
        super(), this.slider = this.querySelector("[data-slider-options]"), this.init()
    }
    init() {
        let e = this.slider.getAttribute("data-slider-options");
        if (null === e || "" === e) return null;
        let i = $.extend(!0, {
                effect: "slide",
                direction: "horizontal",
                autoplay: !0,
                autoplaySpeed: 5,
                space: 30,
                center: !0,
                options: {}
            }, JSON.parse(e)),
            t = /^\d+$/;
        Object.keys(i).forEach(e => {
            "string" == typeof i[e] && t.test(i[e]) && (i[e] = parseInt(i[e], 10))
        });
        let s = !1;
        i.auto_play > 0 && (s = {
            delay: 1e3 * i.auto_play
        });
        let l = !1,
            o = !1;
        "true" === i.loop || !0 === i.loop ? l = !0 : 1 === i.loop ? (l = !0, o = !0) : (o = !1, l = !1);
        let n = $.extend(!0, {
                init: !1,
                spaceBetween: 0,
                loop: l,
                autoplay: s,
                centeredSlides: o,
                navigation: {
                    nextEl: this.slider.querySelector(".swiper-button-next"),
                    prevEl: this.slider.querySelector(".swiper-button-prev")
                },
                pagination: {
                    el: this.slider.querySelector(".swiper-pagination"),
                    clickable: !0
                },
                lazy: !0,
                breakpoints: {
                    320: {
                        slidesPerView: i.mobile,
                        slidesPerColumn: 1
                    },
                    481: {
                        slidesPerView: 2,
                        slidesPerColumn: 1
                    },
                    768: {
                        slidesPerView: 3,
                        slidesPerColumn: 1
                    },
                    940: {
                        slidesPerView: 4,
                        slidesPerColumn: 1
                    },
                    1200: {
                        slidesPerView: i.tablet,
                        slidesPerColumn: 1
                    },
                    1440: {
                        slidesPerView: i.desktop,
                        slidesPerColumn: 1
                    }
                }
            }, i.options),
            r = this.slider.querySelector("[data-insta-slider]"),
            a = new Swiper(r, n);
        a.on("init", () => {
            a.update()
        }), a.init()
    }
}
customElements.define("insta-slider", InstaSlider);

class FlexSlider extends HTMLElement {
    constructor() {
        super(), this.slider = this.querySelector("[data-slider-options]"), this.init()
    }
    init() {
        let e = this.slider.getAttribute("data-slider-options");
        if (null === e || "" === e) return null;
        let i = $.extend(!0, {
                effect: "slide",
                direction: "horizontal",
                autoplay: !0,
                autoplaySpeed: 5,
                space: 30,
                center: !0,
                options: {}
            }, JSON.parse(e)),
            t = /^\d+$/;
        Object.keys(i).forEach(e => {
            "string" == typeof i[e] && t.test(i[e]) && (i[e] = parseInt(i[e], 10))
        });
        let s = !1;
        i.auto_play > 0 && (s = {
            delay: 1e3 * i.auto_play
        });
        let l = !1,
            o = !1;
        "true" === i.loop || !0 === i.loop ? l = !0 : 1 === i.loop ? (l = !0, o = !0) : (o = !1, l = !1);
        let n = $.extend(!0, {
                init: !1,
                spaceBetween: 0,
                loop: l,
                autoplay: s,
                centeredSlides: o,
                navigation: {
                    nextEl: this.slider.querySelector(".swiper-button-next"),
                    prevEl: this.slider.querySelector(".swiper-button-prev")
                },
                pagination: {
                    el: this.slider.querySelector(".swiper-pagination"),
                    clickable: !0
                },
                lazy: !0,
                breakpoints: {
                    320: {
                        slidesPerView: i.mobile,
                        slidesPerColumn: 1
                    },
                    560: {
                        slidesPerView: i.tablet,
                        slidesPerColumn: 1
                    },
                    992: {
                        slidesPerView: i.desktop,
                        slidesPerColumn: 1
                    }
                }
            }, i.options),
            r = this.slider.querySelector("[data-flex-slider]"),
            a = new Swiper(r, n);
        a.on("init", () => {
            a.update()
        }), a.init()
    }
}
customElements.define("flex-slider", FlexSlider);


class RecommendationSlider extends HTMLElement {
    constructor() {
        super(), this.slider = this.querySelector("[data-slider-options]"), this.init()
    }
    init() {
        const e = this.slider.getAttribute("data-slider-options");
        if (null === e || "" === e) return null;
        const t = $.extend(!0, {
                effect: "slide",
                direction: "horizontal",
                autoplay: !0,
                autoplaySpeed: 5,
                space: 30,
                center: !0,
                options: {}
            }, JSON.parse(e)),
            i = /^\d+$/;
        Object.keys(t).forEach((e => {
            "string" == typeof t[e] && i.test(t[e]) && (t[e] = parseInt(t[e], 10))
        }));
        let s = !1;
        t.auto_play > 0 && (s = {
            delay: 1e3 * t.auto_play
        });
        let l = !1,
            r = !1;
        "true" === t.loop || !0 === t.loop ? l = !0 : 1 === t.loop ? (l = !0, r = !0) : (r = !1, l = !1);
        const o = $.extend(!0, {
                init: !1,
                spaceBetween: 30,
                loop: l,
                autoplay: s,
                preventClicks: true,
                preventClicksPropagation: true,
                centeredSlides: r,
                navigation: {
                    nextEl: this.slider.querySelector(".swiper-button-next"),
                    prevEl: this.slider.querySelector(".swiper-button-prev")
                },
                pagination: {
                    el: this.slider.querySelector(".swiper-pagination"),
                    clickable: !0
                },
                lazy: !0,
                focusableElements: 'input, select, option, textarea, video, label',
                breakpoints: {
                    320: {
                        slidesPerView: t.mobile,
                        slidesPerColumn: 1
                    },
                    576: {
                        slidesPerView: t.tablet,
                        slidesPerColumn: 1
                    },
                    990: {
                        slidesPerView: t.laptop,
                        slidesPerColumn: 1
                    },
                    1541: {
                        slidesPerView: t.desktop,
                        slidesPerColumn: 1
                    }
                }
            }, t.options),
            n = this.slider.querySelector("[data-swiper-slider]"),
            a = new Swiper(n, o);
        a.on("init", (() => {
            a.update()
        })), a.init()
    }
}
customElements.define('recommendation-slider', RecommendationSlider);



