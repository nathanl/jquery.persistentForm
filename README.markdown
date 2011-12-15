# Persistent Form - A Delightful Autosaving Plugin for jQuery

## Super Ultra Alpha Version - Woah Now!

This plugin is so alpha, it's not even funny. Tinker at your own risk, or check back soonish. :)

## What it is, yo?

PersistentForm is a plugin to make your forms auto-save using AJAX prior to final submission. It assumes:

- You don't need to validate until final submission - you're just trying to keep your users from losing work along the way
- You want your user to be able to save on demand
- You like speed

## Basic Usage

```javascript
$('#myform').persistentForm();
```

## Configuration

Run with any or all of the following options:

```javascript
$('#myform').persistentForm({
  // URL for ajax posts. Defaults to URL in form's action attribute
  url: '/some/path', 

  // Initial wait time before checking for changes (in milliseconds)
  saveInterval: 3000,

  // Each time the plugin autosaves, it will measure how long
  // it takes for the server to respond. It will then determine 
  // how long to wait before autosaving again by multiplying
  // the response time by this ratio.
  // For example, if the server takes 250ms to respond and you set a ratio of
  // 100, we'll check for changes again in 25000ms (25 seconds).
  saveIntervalRatio: 50,

  // The upper limit on how long to wait between autosaves (in milliseconds).
  // No matter how slow the server is to respond, even if it responds with
  // errors, don't wait longer than this to try autosaving again.
  maxInterval: 300000,

  // Which inputs within the form do you want to autosave?
  // Any valid jQuery selector string is fine, so be as
  // clever as you like: ':input:not(button):not(.ignore)' or whatever
  inputSelectors: ':input:not(button)',

  // jQuery selector for inputs that should be submitted with every save.
  // For example, for forms in Ruby on Rails applications, the authenticity token.
  alwaysInclude: 'input[name="authenticity_token"]',

  // Button which, when clicked, will trigger an incremental AJAX save.
  saveButton: '#saveButton',

  // Element to update with messages like 
  // "Last auto-saved 11:40:54 Friday, September 23, 2011"
  saveTimeDisplay: "#saveMessages",

  // Whether to console.log() debugging messages from
  // within the plugin
  debug: false

});
```
## Design

A few notable design decisions in persistentForm are as follows.

### Autosave immediately when possible

If the plugin is sitting idle and believes the server is ready to accept new data, any changes to the form will be saved immediately. If the server continues to respond quickly, the user may get an autosave after every change to the form.

### Autosave as often as the server can handle

The plugin decides how soon to attempt a new save based on how long the server took to respond to its previous autosave. This decision is process is adjustable using a ratio, but the basic idea is that if the server responds quickly, it is keeping up with its workload and can handle the additional work of frequent autosaves. If it's responding slowly, we reduce the frequency of autosaves to relieve some of its workload.

### Let users save at any moment

Anytime there are unsaved changes, the user can click to save them, regardless of how long the autosave process would otherwise wait.

### Tell changed inputs to get in line

To track when inputs change, the form sets up event listeners on their [change events](http://api.jquery.com/change). One way to handle a change would be as follows:

- Mark the input somehow as changed - add a class or a data attribute, for example.
- When preparing to autosave, search the form for marked elements.
- Gather their data and remove their markers.
- POST the data.

While this might work, it presents some problems. First, it involves a small amount of unnecessary work: searching the form for inputs which we already "found" (when we marked them). Not a big deal, but it feels sloppy.

Second, what if the save fails? If we've removed the markers from inputs that should have been saved, how will we know which ones to try saving again?

Instead of the above, we use a somewhat simpler (and probably faster) collection-based approach. When an input changes, the plugin:

- Immediately adds the input to a collection queued for saving, so there's no need to look for it again later. 
  - For this, jQuery's [add method](http://api.jquery.com/add) is used. jQuery's collections automatically prevent duplicates, so `$collection.add('#input1').add('#input1')` results in only one copy of `#input1` in the collection (or zero, if `#input1` doesn't exist).
- When it's time to save, we already have a collection of inputs that need saving, so we can simply call `.serialize()` on that collection and post the data. The collection is then "set aside" and a new, blank collection is set up as the new queue for future changes.
- If the post fails for some reason, the inputs that should have been saved, which we set aside in the previous step, are added back to the queue for the next attempt.

## Design Part Deux: Visualizing the Autosave Strategy

To understand when persistentForm will save the form's data, it's helpful to picture a pair of light switches.

- The first light switch is labelled **changes**. Whenever an input on the form changes and is queued for saving, this switch is turned on (if it isn't already on).
- The second light switch is labelled **ready**. This switch turns on based on a timer. The timer, in turn, is persistenForm's way of estimating when the server (to which the changes will be sent) will be ready to receive the next autosave.

Whenever **both switches** are turned on, persistentForm will save any changes it has queued up. Once the save happens, both switches will turn back off.

A few things are implied by this mental model.

- There are four possible states: both switches off, both on, only "changes" on, and only "ready" on. Either switch could be turned on before the other.
- The four states break down as follows:
  - If the "changes" switch is turned on before "ready", the form has unsaved changes that it's waiting for an opportunity to save. As soon as the timer goes off, the "ready" switch will go up, the save will happen, and both switches will turn off.
  - If the "ready" switch is turned on first (because the timer has expired), the form is eager to save any changes that may come in. As soon as a change comes in, the "changes" switch will go up, the save will happen, and both switches will turn off.
  - If both switches are off, there are no changes ready to be sent, and the plugin isn't ready to send them anyway; it is counting down to the moment when it thinks the server will be ready to get another batch of changes.
  - If both switches are on, an autosave is in progress. This state should last only a moment.

Finally, remember that the user can save their changes anytime they want, so although the "ready" switch will normally be turned on by the timer, the user can manually turn it on anytime, saving any unsaved changes. Just as with an autosave, this user-initiated save turns both switches off and restarts the timer based on how long it took the server to process the save.

You can get an intuitive feel for how this process works by setting the `debug` option to `true` and watching the messages that persistentForm logs about its activities.

## Development

### Running the tests

Testing AJAX is haaaaarrrd! To make it easy on myself, I test them against running server software, rather than trying to simulate requests going out, taking some time, and coming back with response codes.

To run the tests, you need that server, too. Fortunately, it's not so hard. Do this (assuming a Unix-family OS):

- Install Ruby if you don't have it yet
- Change to the plugin's directory on the command line
- `gem install bundler`
- `bundle install` - this will install the Sinatra gem for running local servers
- `ruby server.rb` - starts the server running
- Visit `http://localhost:4567` and click the link for the tests

## TODO

- To prevent users from losing work while typing a large amount of text in a text area, count keyup events and fire a change event on that textarea after some number of keystrokes (15?).
- Add test for "fields to always submit" option, such as Rails CSRF token
- Check into possible race conditions and prevent them.
  - A new POST should not begin until the previous one has finished or been deliberately abandoned and cleaned up after.
  - Taking care of that should prevent two POSTS from fighting over the timer, but just make sure
- Add a way to "turn off" the autosaving - maybe set a "disabled" property and check it before setting any of the timers.
  - Also unbind all event listeners and remove pointer to plugin?
