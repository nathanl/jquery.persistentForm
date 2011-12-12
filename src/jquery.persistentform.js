// ---------------------------------------------
// persistentForm v0.2
// A jQuery plugin by Nathan Long
// https://github.com/sleeplessgeek/jquery.persistentForm
// ---------------------------------------------

(function($){
    $.persistentForm = function(el, options){
        var base = this;
        
        if ($(el).is('form')) {
          // References to jQuery and DOM versions of element
          base.$el = $(el);
          base.el = el;
        } else {
          throw "persistentForm must be bound to a form element";
        }

        // Add a reverse reference to the DOM object
        base.$el.data("persistentForm", base);

        base.setState = function(state) {
          if (base.options.debug) {
            if (base.state === state) {
              console.log('maintaining state of ' + state); 
            } else {
              console.log('set state to ' + state); 
            }
            console.log('-------');
          }
          base.state = state;
        };

        base.autoSave = function() {
          if (base.options.debug) {console.log('state is currently',base.state,'- autoSave is ready');}
          switch (base.state) {
          case 'unsavedChanges':
            base.save(true);
            break;
          case 'idle':
          case 'autoSaving':
          default:
            base.setState('autoSaving');
            break;
          }
        };

        base.queueForAutoSave = function(inputs){

          // Append the inputs to our collection, along with any that should always be saved
          base.$changedInputs = base.$changedInputs.add(inputs).add(base.$alwaysInclude);

          // Update button to show that there are unsaved changes
          base.setButtonState('active');
          
          if (base.options.debug) {console.log('state is currently',base.state,'- queueing changes');}
          switch (base.state) {
          case 'autoSaving':
            base.save(true);
            break;
          case 'idle':
          case 'unsavedChanges':
          default:
            base.setState('unsavedChanges');
            // do nothing
            break;
          }
        };


        base.save = function(auto) {

          // If there's anything that needs saving
          if (base.$changedInputs.length > 0) {

            // Create a local pointer to the inputs queued for saving
            var $inputsBeingSaved = base.$changedInputs;
            
            // Go ahead and clear that queue - if AJAX fails, we'll put our inputs back
            base.clear_autosave_queue();

            // Extract the inputs' data
            var formData = $inputsBeingSaved.serialize();

            base.timer.start();

            // Attempt to save via ajax
            $.post(base.url,formData).done(function(){
              if (base.options.debug) {console.log('saved:',formData);}

              base.timer.stop();

              base.options.saveInterval = base.getSaveInterval(base.timer.elapsed());
              base.setState('idle');
              setTimeout(base.autoSave, base.options.saveInterval);

              base.setButtonState('inactive');
              base.updateSaveTimeDisplay(new Date(), auto);

            }).fail(function(){ // if the request fails
              base.options.saveInterval = Math.min(base.options.saveInterval * 2, base.options.maxInterval);
              if (base.options.debug) {console.log('failed to save; save interval now',base.options.saveInterval);}
              setTimeout(base.autoSave, base.options.saveInterval);
              base.setState('unsavedChanges');
              base.queueForAutoSave($inputsBeingSaved);
            }).always(function(){
              // either way
            });
          }

        };

        base.timer = {
          startTime: null,
          endTime:   null,
          start: function() { this.startTime = new Date(); },
          stop: function()  { this.endTime   = new Date(); },
          elapsed: function(){ return this.endTime.getTime() - this.startTime.getTime(); }
        };

        base.updateSaveTimeDisplay = function(date, auto) {
          var d, description, dateString, timeString;
          d = date;

          description = auto ? 'Last auto-saved' : 'Last saved';
          
          // International-friendly formatting
          timeString = d.toLocaleTimeString();
          dateString = d.toLocaleDateString();

          $(base.options.saveTimeDisplay).html(description + ' ' + timeString  + ' ' + dateString);
        };

        base.setButtonState = function(state) {
          switch (state) {
          case 'inactive':
            $(base.options.saveButton).removeClass('active');
            break;
          case 'active':
          default:
            $(base.options.saveButton).addClass('active');
            break;
          }
        };

        base.getSaveInterval = function(requestTime) {
          var interval;

          var calculated = requestTime * base.options.saveIntervalRatio;
          if (isNaN(calculated)) {
            interval = base.options.saveInterval;
          } else {
            interval =  calculated;
          }

          interval = interval < base.options.maxInterval ? interval : base.options.maxInterval;

          if (base.options.debug) {console.log('request time',requestTime,'ms - save again in',interval,'ms');}
          return interval;
        };

        base.clear_autosave_queue = function() {
          // Point to an empty collection of DOM elements again
          base.$changedInputs = $('');
        };

        base.init = function(){
            
            base.options = $.extend({},$.persistentForm.defaultOptions, options);

            if (base.options.debug) {
              console.log('Current persistentForm options are', base.options);
            }

            // Unless a URL is provided, use the one in the form's action
            base.url = base.options.url === undefined ? base.$el.attr('action') : base.options.url;
            
            // Initialize an empty collection of DOM elements; 
            // in the process of autosaving, inputs will be queued in it
            // and cleared back out
            base.$changedInputs = $();

            // There may be inputs we always want saved (such as a Rails CSRF token).
            // Collect those up once.
            base.$alwaysInclude = $(base.options.alwaysInclude);

            // Set up save button
            $(base.options.saveButton).click(function(e){
              base.setButtonState('inactive');
              e.preventDefault();
              base.save();
            });

            // If any inputs on the form change, queue them to be autosaved
            base.$el.delegate(base.options.inputSelectors,'change',function(){
              base.queueForAutoSave($(this));
            });

            // Three states - unsavedChanges, idle, or autoSaving
            base.setState('autoSaving');
        };

        // Run initializer
        base.init();
    };

    $.persistentForm.defaultOptions = {
        url: undefined, // defaults to form's action
        saveInterval: 3000,
        saveIntervalRatio: 50,
        maxInterval: 30000, 
        inputSelectors: ':input:not(button)',
        alwaysInclude: undefined,
        saveButton: '#saveButton',
        saveTimeDisplay: "#saveTimeDisplay",
        debug: false
    };
    
    $.fn.persistentForm = function(options){
        return this.each(function(){
            (new $.persistentForm(this, options));
        });
    };
    
    // This function breaks the chain, but returns
    // the persistentForm if it has been attached to the object.
    $.fn.getpersistentForm = function(){
        this.data("persistentForm");
    };
    
})(jQuery);
