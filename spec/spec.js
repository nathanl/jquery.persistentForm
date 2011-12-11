describe("persistentForm", function() {

  beforeEach(function() {
    loadFixtures('form.html');
    $form = $('#theForm');
  });

  it("has the plugin attached", function() {

    $form.persistentForm();

    // I don't see a more precise way to test this at the moment
    expect(typeof($form.data('persistentForm'))).toEqual('object');

  });

  feature("Queueing changed inputs for autosave", function(){

    story("User changes one or more inputs while the plugin is in idle mode", function(){

      beforeEach(function(){
        $form.persistentForm({inputSelectors: 'input, select'});
        // Set plugin to idle - the timer is running
        $form.data('persistentForm').setState('idle');
        $firstInput = $form.find('input:first');
        $firstSelect = $form.find('select:first');
      });

      scenario("If the changed input(s) are being watched by persistentForm", function(){

        when("changing some inputs", function(){
          $firstInput.val('stegasaurus').trigger('change');
          $firstSelect.val('bbq').trigger('change');
        });

        then("the inputs should be queued to be saved", function(){
          expect($form.data('persistentForm').$changedInputs.length).toEqual(2);
          expect($form.data('persistentForm').$changedInputs[0]).toBe($firstInput[0]);
          expect($form.data('persistentForm').$changedInputs[1]).toBe($firstSelect[0]);
        });

      });

      scenario("If the changed input(s) are NOT being watched by persistentForm", function(){

        when("changing a select", function(){
          var sel = $form.find('textarea:first').focus().val('BBQ').trigger('change');
        });

        then("the select should NOT be queued to be saved", function(){
          expect($form.data('persistentForm').$changedInputs.length).toEqual(0);
        });

      });

    });

  });

  feature("Measuring elapsed time", function(){
    beforeEach(function(){
      $form.persistentForm({inputSelectors: 'input, select'});
      plugin = $form.data('persistentForm');
    });

    scenario("when dealing with known start and stop times", function(){

      when("start time and stop time are 500 ms apart", function(){
        plugin.timer.startTime = new Date(2012, 0, 1, 0, 0, 0, 0);
        plugin.timer.endTime   = new Date(2012, 0, 1, 0, 0, 0, 500);
      });

      then("elapsed time should be 500 ms", function(){
        expect(plugin.timer.elapsed()).toEqual(500);
      });

    });

    // This is here to document that this test is a bad idea, so
    // that nobody thinks they should add such a thing.
    //
    // The test kinda sorta works, but:
    // 
    // 1) Hacking together a "sleep" like this produces results
    // that are not completely predictable
    // 2) Since we've already tested the elapsed() method, this
    // really just tests start() and stop(), which are so simple
    // that it's not necessary.
    //
    // scenario("when a known amount of time passes", function(){
    //   when("we start and stop the time at known points", function(){
    //     plugin.timer.start();
    //     startTime = new Date().getTime();
    //     endTime = startTime + 10;
    //
    //     // A hacked-together sleep function
    //     while(new Date().getTime() < endTime) {
    //       // Do something useless
    //       1 + 1;
    //     }
    //     plugin.timer.stop();
    //   });

    //   then("elapsed time should be correct", function(){
    //     expect(plugin.timer.elapsed()).toEqual(10);
    //   });
    // });

  });

  feature("Varying the autosave interval according to the server response", function(){

    story("A successful post", function(){

      scenario("Normal response", function(){

        runs(function(){
          when("the response time is within a reasonable time", function(){
            $form.persistentForm({
              inputSelectors: 'input, select', 
              url: '/dummysave',
              saveInterval: 3000,
              saveIntervalRatio: 2
            });

            // Reference to the initialized plugin
            plugin = $form.data('persistentForm');

            // We need at least one changed input to save
            plugin.$changedInputs = $form.find('input:first');
            plugin.save();
          });
        });

        waits(100); // Arbitrary - must be long enough for the POST to complete

        runs(function(){
          then("the autosave interval should vary based on response time", function(){
            var newInterval = plugin.options.saveIntervalRatio * plugin.timer.elapsed();
            expect($form.data('persistentForm').options.saveInterval).toEqual(newInterval);
          });
        });

      });

      scenario("Unexpectedly slow response", function(){
        runs(function(){
          when("the response time is long (or the interval ratio is high)", function(){
            $form.persistentForm({
              inputSelectors: 'input, select', 
              saveInterval: 3000,
              saveIntervalRatio: 500, // wait 500x the response time before saving again
              url: '/dummysave',
              maxInterval: 20000
            });

            // Reference to the initialized plugin
            plugin = $form.data('persistentForm');

            // We need at least one changed input to save
            plugin.$changedInputs = $form.find('input:first');
            plugin.save();

          });
        });

        waits(100); // Arbitrary - must be long enough for the POST to complete

        runs(function(){
          then("the autosave interval should increase only to the allowed max", function(){
            expect(plugin.options.saveInterval).toEqual(plugin.options.maxInterval);
          });
        });

      });

    });

    story("The server responds with an error", function(){
      runs(function(){
        when("doubling the save interval wouldn't exceed the max", function(){
          $form.persistentForm({
            inputSelectors: 'input, select', 
            saveInterval: 3000,
            saveIntervalRatio: 5,
            maxInterval: 30000,
            url: '/failwhale',
            debug: true
          });

          // Reference to the initialized plugin
          plugin = $form.data('persistentForm');

          doubledInterval = plugin.options.saveInterval * 2;

          // We need at least one changed input to save
          plugin.$changedInputs = $form.find('input:first');
          plugin.save();

        });
      });

      waits(100); // Arbitrary - must be long enough for the POST to complete

      runs(function(){
        then("the autosave interval should double", function(){
          expect(plugin.options.saveInterval).toEqual(doubledInterval);
        });
      });

      runs(function(){
        when("doubling the save interval would exceed the max", function(){
          $form.persistentForm({
            inputSelectors: 'input, select', 
            saveInterval: 3000,
            saveIntervalRatio: 5,
            maxInterval: 5000,
            url: '/failwhale',
            debug: true
          });

          // Reference to the initialized plugin
          plugin = $form.data('persistentForm');

          doubledInterval = plugin.options.saveInterval * 2;

          // We need at least one changed input to save
          plugin.$changedInputs = $form.find('input:first');
          plugin.save();

        });
      });

      waits(100); // Arbitrary - must be long enough for the POST to complete

      runs(function(){
        then("the autosave interval should reach the max", function(){
          expect(plugin.options.saveInterval).toEqual(plugin.options.maxInterval);
        });
      });

    });

    story("The server responds with an error and the intial save interval is high", function(){
      runs(function(){
        when("the server responds with a 500 error", function(){
          $form.persistentForm({
            inputSelectors: 'input, select', 
            saveInterval: 3000,
            url: '/failwhale',
            maxInterval: 20000,
            debug: true
          });

          // Reference to the initialized plugin
          plugin = $form.data('persistentForm');

          doubledInterval = plugin.options.saveInterval * 2;

          // We need at least one changed input to save
          plugin.$changedInputs = $form.find('input:first');
          plugin.save();

        });
      });

      waits(100); // Arbitrary - must be long enough for the POST to complete

      runs(function(){
        then("the autosave interval should double", function(){
          expect(plugin.options.saveInterval).toEqual(doubledInterval);
        });
      });

    });

  });

});
