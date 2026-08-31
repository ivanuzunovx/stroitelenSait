/* =========================================================================
   SGM PRO — main.js
   Vanilla JavaScript
   ========================================================================= */

(function () {
  'use strict';

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ====================================================
     STICKY HEADER
  ==================================================== */

  function initHeader() {

    var header = document.getElementById('header');

    if (!header) return;

    function onScroll() {

      header.classList.toggle(
        'is-stuck',
        window.scrollY > 8
      );

    }

    onScroll();

    window.addEventListener(
      'scroll',
      onScroll,
      { passive: true }
    );
  }


  /* ====================================================
     MOBILE NAVIGATION
  ==================================================== */

  function initMobileNav() {

    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('nav');
    var backdrop = document.getElementById('backdrop');

    if (!toggle || !nav) return;


    function setOpen(open) {

      nav.classList.toggle(
        'is-open',
        open
      );

      toggle.classList.toggle(
        'is-open',
        open
      );

      toggle.setAttribute(
        'aria-expanded',
        open ? 'true' : 'false'
      );

      toggle.setAttribute(
        'aria-label',
        open ? 'Затвори менюто' : 'Отвори менюто'
      );


      if (backdrop) {

        backdrop.classList.toggle(
          'is-on',
          open
        );

      }


      document.body.style.overflow =
        open ? 'hidden' : '';
    }


    toggle.addEventListener(
      'click',
      function () {

        setOpen(
          !nav.classList.contains('is-open')
        );

      }
    );


    nav.querySelectorAll('a').forEach(
      function (link) {

        link.addEventListener(
          'click',
          function () {

            setOpen(false);

          }
        );

      }
    );


    if (backdrop) {

      backdrop.addEventListener(
        'click',
        function () {

          setOpen(false);

        }
      );

    }


    document.addEventListener(
      'keydown',
      function (event) {

        if (
          event.key === 'Escape' &&
          nav.classList.contains('is-open')
        ) {

          setOpen(false);

          toggle.focus();

        }

      }
    );


    window.addEventListener(
      'resize',
      function () {

        if (
          window.innerWidth > 980 &&
          nav.classList.contains('is-open')
        ) {

          setOpen(false);

        }

      }
    );
  }


  /* ====================================================
     PROJECT FILTER
  ==================================================== */

  function initFilter() {

    var grid =
      document.getElementById('projGrid');

    var buttons =
      document.querySelectorAll('.filter');

    if (!grid || !buttons.length) return;


    var items =
      Array.prototype.slice.call(
        grid.querySelectorAll('.proj')
      );


    buttons.forEach(
      function (button) {

        button.addEventListener(
          'click',
          function () {

            var filter =
              button.getAttribute('data-filter');


            buttons.forEach(
              function (item) {

                var active =
                  item === button;

                item.classList.toggle(
                  'is-active',
                  active
                );

                item.setAttribute(
                  'aria-pressed',
                  active ? 'true' : 'false'
                );

              }
            );


            items.forEach(
              function (item) {

                var match =
                  filter === 'all' ||
                  item.getAttribute('data-type') === filter;

                item.classList.toggle(
                  'is-hidden',
                  !match
                );

              }
            );

          }
        );

      }
    );
  }


  /* ====================================================
     STAT COUNTERS
  ==================================================== */

  function initCounters() {

    var groups =
      document.querySelectorAll('[data-counters]');

    if (!groups.length) return;


    function animate(element) {

      var target =
        parseFloat(
          element.getAttribute('data-count')
        ) || 0;

      var suffix =
        element.getAttribute('data-suffix') || '';


      if (reduceMotion) {

        element.textContent =
          target + suffix;

        return;
      }


      var start = null;
      var duration = 1400;


      function step(timestamp) {

        if (start === null) {

          start = timestamp;

        }


        var progress =
          Math.min(
            (timestamp - start) / duration,
            1
          );


        var eased =
          1 - Math.pow(
            1 - progress,
            3
          );


        element.textContent =
          Math.round(
            target * eased
          ) + suffix;


        if (progress < 1) {

          requestAnimationFrame(step);

        } else {

          element.textContent =
            target + suffix;

        }

      }


      requestAnimationFrame(step);
    }


    if (!('IntersectionObserver' in window)) {

      groups.forEach(
        function (group) {

          group
            .querySelectorAll('[data-count]')
            .forEach(animate);

        }
      );

      return;
    }


    var observer =
      new IntersectionObserver(
        function (entries, observerInstance) {

          entries.forEach(
            function (entry) {

              if (entry.isIntersecting) {

                entry.target
                  .querySelectorAll('[data-count]')
                  .forEach(animate);


                observerInstance.unobserve(
                  entry.target
                );

              }

            }
          );

        },
        {
          threshold: 0.35
        }
      );


    groups.forEach(
      function (group) {

        observer.observe(group);

      }
    );
  }


  /* ====================================================
     SCROLL REVEAL
  ==================================================== */

  function initReveal() {

    var elements =
      document.querySelectorAll('.reveal');

    if (!elements.length) return;


    if (
      reduceMotion ||
      !('IntersectionObserver' in window)
    ) {

      elements.forEach(
        function (element) {

          element.classList.add('is-in');

        }
      );

      return;
    }


    var observer =
      new IntersectionObserver(
        function (entries, observerInstance) {

          entries.forEach(
            function (entry) {

              if (entry.isIntersecting) {

                entry.target.classList.add(
                  'is-in'
                );


                observerInstance.unobserve(
                  entry.target
                );

              }

            }
          );

        },
        {
          threshold: 0.14,
          rootMargin: '0px 0px -8% 0px'
        }
      );


    elements.forEach(
      function (element) {

        observer.observe(element);

      }
    );
  }


  /* ====================================================
     BACK TO TOP
  ==================================================== */

  function initToTop() {

    var button =
      document.getElementById('toTop');

    if (!button) return;


    function onScroll() {

      button.classList.toggle(
        'is-on',
        window.scrollY > 700
      );

    }


    onScroll();


    window.addEventListener(
      'scroll',
      onScroll,
      { passive: true }
    );


    button.addEventListener(
      'click',
      function () {

        window.scrollTo({
          top: 0,
          behavior: reduceMotion
            ? 'auto'
            : 'smooth'
        });

      }
    );
  }


  /* ====================================================
     QUOTE FORM
  ==================================================== */

  function initForm() {

    var form =
      document.getElementById('quoteForm');

    if (!form) return;


    var success =
      document.getElementById('formSuccess');

    var imageInput =
      document.getElementById('qf-images');

    var imageError =
      document.getElementById('imageError');

    var fileList =
      document.getElementById('fileList');


    /* Maximum allowed size for one image: 5 MB */

    var MAX_IMAGE_SIZE =
      5 * 1024 * 1024;


    /* Allowed image MIME types */

    var ALLOWED_TYPES = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];


    /* ==================================================
       FIELD VALIDATION
    ================================================== */

    function fieldOf(input) {

      return (
        input.closest('.field') ||
        input.closest('.consent')
      );

    }


    function validateField(input) {

      var wrapper =
        fieldOf(input);

      var valid = true;


      /* Checkbox */

      if (input.type === 'checkbox') {

        valid =
          input.checked;

      }


      /* Email */

      else if (input.type === 'email') {

        valid =
          input.value.trim().length > 0 &&
          input.checkValidity();

      }


      /* Required select */

      else if (
        input.tagName === 'SELECT' &&
        input.hasAttribute('required')
      ) {

        valid =
          input.value.trim().length > 0;

      }


      /* Required text fields */

      else if (
        input.hasAttribute('required')
      ) {

        valid =
          input.value.trim().length > 0;

      }


      if (
        wrapper &&
        wrapper.classList.contains('field')
      ) {

        wrapper.classList.toggle(
          'invalid',
          !valid
        );

      }


      return valid;
    }


    /* ==================================================
       PHONE VALIDATION
    ================================================== */

    var phoneInput =
      document.getElementById('qf-phone');


    if (phoneInput) {

      phoneInput.addEventListener(
        'input',
        function () {

          /*
             Allow digits only.
             Remove letters, spaces and special characters.
          */

          this.value =
            this.value.replace(
              /[^0-9]/g,
              ''
            );

        }
      );

    }


    /* ==================================================
       REQUIRED FIELD EVENTS
    ================================================== */

    var required =
      form.querySelectorAll('[required]');


    required.forEach(
      function (input) {

        input.addEventListener(
          'blur',
          function () {

            validateField(input);

          }
        );


        input.addEventListener(
          'input',
          function () {

            var wrapper =
              fieldOf(input);


            if (
              wrapper &&
              wrapper.classList.contains('invalid')
            ) {

              validateField(input);

            }

          }
        );


        input.addEventListener(
          'change',
          function () {

            validateField(input);

          }
        );

      }
    );


    /* ==================================================
       IMAGE VALIDATION
    ================================================== */

    function validateImages() {

      if (!imageInput) return true;


      var files =
        Array.prototype.slice.call(
          imageInput.files
        );


      if (imageError) {

        imageError.classList.remove(
          'is-on'
        );

      }


      if (fileList) {

        fileList.innerHTML = '';

      }


      if (!files.length) {

        return true;

      }


      var valid = true;


      files.forEach(
        function (file) {

          if (
            ALLOWED_TYPES.indexOf(
              file.type
            ) === -1
          ) {

            valid = false;

          }


          if (
            file.size > MAX_IMAGE_SIZE
          ) {

            valid = false;

          }

        }
      );


      if (!valid) {

        if (imageError) {

          imageError.classList.add(
            'is-on'
          );

        }

        return false;

      }


      /* Display selected files */

      if (fileList) {

        files.forEach(
          function (file) {

            var item =
              document.createElement('div');


            item.className =
              'selected-file';


            item.textContent =
              file.name;


            fileList.appendChild(item);

          }
        );

      }


      return true;
    }


    if (imageInput) {

      imageInput.addEventListener(
        'change',
        function () {

          validateImages();

        }
      );

    }


    /* ==================================================
       FORM SUBMISSION
    ================================================== */

    form.addEventListener(
      'submit',
      async function (event) {

        /*
           Prevent the normal form submission.
           The request is sent using fetch instead.
        */

        event.preventDefault();


        var allValid = true;
        var firstInvalid = null;


        /* Validate required fields */

        required.forEach(
          function (input) {

            var valid =
              validateField(input);


            if (!valid) {

              allValid = false;


              if (!firstInvalid) {

                firstInvalid = input;

              }

            }

          }
        );


        /* Validate uploaded images */

        if (!validateImages()) {

          allValid = false;


          if (!firstInvalid) {

            firstInvalid = imageInput;

          }

        }


        /* Stop submission if validation fails */

        if (!allValid) {

          if (firstInvalid) {

            firstInvalid.focus();

          }

          return;

        }


        /* ==================================================
           SUBMIT BUTTON
        ================================================== */

        var submitButton =
          form.querySelector(
            'button[type="submit"]'
          );


        var originalButtonHTML =
          submitButton
            ? submitButton.innerHTML
            : '';


        if (submitButton) {

          submitButton.disabled = true;

          submitButton.innerHTML =
            'Изпращане...';

        }


        /* ==================================================
           SEND FORM DATA TO FLASK
        ================================================== */

        try {

          var formData =
            new FormData(form);


          var response =
            await fetch(
              form.action || '/send-quote',
              {
                method: 'POST',
                body: formData
              }
            );


          /*
             Flask should return HTTP 200
             when the email is sent successfully.
          */

          if (!response.ok) {

            throw new Error(
              'Server returned ' +
              response.status
            );

          }


          /* ==================================================
             SUCCESS
          ================================================== */

          if (success) {

            success.classList.add(
              'is-on'
            );

          }


          /*
             Disable the form after successful submission.
          */

          form.querySelectorAll(
            'input, select, textarea'
          ).forEach(
            function (element) {

              element.disabled = true;

            }
          );


          if (submitButton) {

            submitButton.disabled = true;

            submitButton.innerHTML =
              'Изпратено ✓';

          }


          /* Scroll to the success message */

          if (success) {

            success.scrollIntoView({
              behavior: reduceMotion
                ? 'auto'
                : 'smooth',
              block: 'center'
            });

          }


        } catch (error) {

          console.error(
            'FORM ERROR:',
            error
          );


          /*
             Show an error only when the request
             actually fails.
          */

          if (success) {

            success.classList.remove(
              'is-on'
            );

          }


          alert(
            'Възникна проблем при изпращането на запитването. Моля, опитайте отново.'
          );


          if (submitButton) {

            submitButton.disabled = false;

            submitButton.innerHTML =
              originalButtonHTML;

          }

        }

      }
    );
  }


  /* ====================================================
     INITIALIZE APPLICATION
  ==================================================== */

  function boot() {

    initHeader();

    initMobileNav();

    initFilter();

    initCounters();

    initReveal();

    initToTop();

    initForm();

  }


  /* ====================================================
     START APPLICATION
  ==================================================== */

  if (
    document.readyState === 'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      boot
    );

  } else {

    boot();

  }

})();