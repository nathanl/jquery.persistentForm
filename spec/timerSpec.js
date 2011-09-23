describe("persistentForm", function() {

  beforeEach(function() {
    loadFixtures('form.html');
    $form = $('#theForm');
  });

  it("has the plugin attached", function() {

    $form.persistentForm({url: '/dummysave', saveButton: 'a.save.btn', saveIntervalRatio: 100, debug: true});
    persistentFormInstance = $form.data('persistentForm');

    // I don't see a more precise way to test this at the moment
    expect(typeof(persistentFormInstance)).toEqual('object');
    if (window && window.console) {console.log(persistentFormInstance);}
    // console.log($form.getpersistentForm());

  });

  // Use feature > story > scenario
  // feature("Queueing changed inputs for autosave", function(){

  //   story("User changes one of the inputs in the form", function(){

  //     scenario("The input is not one that the plugin is watching for", function(){

  //       given("the plugin has been asked to watch only inputs, not selects", function(){
  //         $form.persistentForm({inputSelectors: 'input'});
  //       });

  //       when("changing a select", function(){
  //         // find a select and change it
  //       });

  //       then("the list of inputs queued to be save should be empty", function(){
  //         // expect($form.data('persistentForm').
  //     
  //       });

  //     });

  //   });

  // });

});
