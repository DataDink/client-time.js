client-time.js
==============

A jQuery plugin.

This was an experiment to provide a time-conversion plugin that could both read and write dates/times using the same, customizable format strings.

For a more standard and tested solution please, instead, go here:
http://stackoverflow.com/questions/3830418/is-there-a-jquery-plugin-to-convert-utc-datetimes-to-local-user-timezone

----

If you still want to go ahead and use this, here is what you need to know:

**Rules of Thumb**
* Edit the "formatters" collection to customize your formatter strings
* Always order your formatters from longest to shortest: i.e. 'yyyy' before 'yyy'
* Always order your formatters in order of importance: i.e. 'hh' before 'tt'. (this is so that the am/pm can be applied after the hour is already set)
* Don't use greater-than or less-than (<>) in your formatters because it will cause a bug

**Parts of a Formatter**
* Pattern: This is the representation of a value that can be set in a format string
* Parser:  This is a regular expression describing what the value will look like
* Reader:  A function that returns a formatted value pulled from a mapped date object
* Mapper:  Applies a value parsed from a date/time string to a javascript Date object

**Samples:**

----

```html
<input type="text" value="April 1, 1999 10:12 pm" data-time-format="MMMM d, yyyy h:mm tt" />
```
```javascript
$('input').clientTime();
```

----

```html
<div data-time-format="MMMM d, yyyy h:mm tt">April 1, 1999 10:12 pm</div>
```
```javascript
$('div').clientTime();
```

----
