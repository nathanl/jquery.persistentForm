describe("persistentForm", function() {

  beforeEach(function() {
    loadFixtures('form.html');
    $form = $('#theForm');
    jasmine.Ajax.useMock();

    // request.response(TestResponses.save.success);
    request = mostRecentAjaxRequest();
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

        then("the select shoudl NOT be queued to be saved", function(){
          expect($form.data('persistentForm').$changedInputs.length).toEqual(0);
        });

      });

    });

  });

});
