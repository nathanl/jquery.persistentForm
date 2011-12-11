# Persistent Form - A Delightful Autosaving Plugin for jQuery

## Super Ultra Alpha Version - Woah Now!

This plugin is so alpha, it's not even funny. Tinker at your own risk, or check back soonish. :)

## What it is, yo?

PersistentForm is a plugin to make your forms auto-save using AJAX prior to final submission. It assumes:

- You don't need to validate until final submission - you're just trying to keep your users from losing work along the way
- You want your user to be able to save on demand
- You like speed

## Speediness

A few things that make persistentForm speedy:

(coming soon)

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

  // Initial wait time before checking for changes
  saveInterval: 3000,


  // Which inputs within the form do you want to autosave?
  // Any valid jQuery selector string is fine, so be as
  // clever as you like: 'input:not(".secret")' or whatever
  inputSelectors: 'input,select,textarea',

  // Button which, when clicked, will trigger an incremental
  // AJAX save
  saveButton: '#saveButton',

  // Element to update with messages like 
  // "Last auto-saved 11:40:54 Friday, September 23, 2011"
  saveTimeDisplay: "#saveMessages",

  // If provided, triggers experimental behavior: 
  // plugin dynamically adjusts how often it tries
  // to autosave based on how long the server takes
  // to respond. It calculates the server response time
  // and multiplies by this ratio. For example, if the server
  // takes 250ms to respond and you set a ratio of 100,
  // we'll check for changes again in 25000ms (25 seconds).
  saveIntervalRatio: 100,

  // Whether to console.log() debugging messages from
  // within the plugin
  debug: false

});
```

## Development

### Running the tests

Testing AJAX is haaaaarrrd! To make it easy on myself, I test them against running server software, rather than trying to simulate requests going out, taking some time, and coming back with response codes.

To run the tests, you need that server, too. Fortunately, it's not so hard. Do this:

- Install Ruby if you don't have it yet
- `gem install bundler`
- `bundle install` - this will install the Sinatra gem for running local servers
- `ruby server.rb` - starts the server running
- Visit localhost:4567 and click the link for the tests

## TODO

- To prevent users from losing work while typing a large amount of text in a text area, count keyup events and fire a change event on that textarea after some number of keystrokes (15?).
- Add test for "fields to always submit" option, such as Rails CSRF token
