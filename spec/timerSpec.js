describe("persistentForm", function() {

  beforeEach(function() {
    loadFixtures('form.html');
    $form = $('#theForm');
    jasmine.Ajax.useMock();

    // onSuccess = jasmine.createSpy('onSuccess');
    // onFailure = jasmine.createSpy('onFailure');

    // request.response(TestResponses.save.success);
    request = mostRecentAjaxRequest();
  });

  it("has the plugin attached", function() {

    $form.persistentForm({url: '/dummysave', saveButton: 'a.save.btn', saveIntervalRatio: 100, debug: true});
    persistentFormInstance = $form.data('persistentForm');

    // I don't see a more precise way to test this at the moment
    expect(typeof(persistentFormInstance)).toEqual('object');

  });

  feature("Queueing changed inputs for autosave", function(){

    story("User changes an input while the plugin is in idle mode", function(){

      beforeEach(function(){
        $form.persistentForm({inputSelectors: 'input, select'});
        // Set plugin to idle - the timer is running
        $form.data('persistentForm').setState('idle');
      });

      scenario("If the input is one that the plugin is watching for", function(){

        when("changing an input", function(){
          $input = $form.find('input:first');
          $input.val('BBQ').trigger('change');
        });

        then("the list of inputs queued to be save should be empty", function(){
          expect($form.data('persistentForm').$changedInputs.length).toEqual(1);
        });

      });

      scenario("If the input is NOT one that the plugin is watching for", function(){

        when("changing a select", function(){
          var sel = $form.find('textarea:first').focus().val('BBQ').trigger('change');
        });

        then("the list of inputs queued to be save should be empty", function(){
          expect($form.data('persistentForm').$changedInputs.length).toEqual(0);
        });

      });

    });

  });

});
