# AngularJS datepicker directives

## WIP

<a href="https://travis-ci.org/eralha/angular-datepicker" target="_blank">
<img src="https://travis-ci.org/eralha/angular-datepicker.svg" /></a> 
<a href="http://gruntjs.com/" target="_blank"><img src="https://cdn.gruntjs.com/builtwith.png" alt="" /></a>

#### Requirements

-  Angular v1.2+


#### Development version 

Checkout, run `npm install` and `bower install`.
To build run `grunt build`

## Examples

[Live demo](https://rawgithub.com/g00fy-/angular-datepicker/master/app/index.html)

## Installation

Install with bower `bower install --save angular-datepicker`
Inject the dependency `angular.module('testApp', ['datePicker'])`

##### defaults

```html
<div date-picker="start"></div>
```


##### views:

(initial) view

```html
<div date-picker="start" view="year"></div>
```

(max) view

```html
<div date-picker="start" max-view="month"></div>
```

(min) view 

##### only date view

```html
<div date-picker="start" min-view="date"></div>
```

##### Close the picker when min-view is reached

```html
<div date-picker="start" auto-close="true"></div>
```

##### Min and Max Date

<p>Only add's validation to ngModel, must be provided a valid date object or valid date string.</p>

```html
<div date-picker="start" min-date="Date string | Expression" max-date="Date string | Expression"></div>
```

##### Watch direct date changes within the parent scope and update the view accordingly

<p>Without this attribute the date picker stays on the same view page when you update the date within the parent scope manually even if the picked date happens to be on another one. For example, you pick September 18 2015, then you manually change it to October 25 2014, nonetheless the picked date updates accordingly, the date picker still displays the pick screen for September 2015 and you have to swipe pages manually.</p>

```html
<div date-picker="start" watch-direct-changes></div>
```

##### Execute callback upon date set

<p>Execute callback when a new date set in a highest resolution available, e.g. if you specify min-view="hour" the callback will be executed only when the user picks an hour, not just date, month or year. Alternatively, you can bind yo a new even 'setMaxDate'.</p>

<p>Within your controller</p>
```js
function callback() {
  doStuff();
}
```
<p>In your html</p>
```html
<div date-picker="start" on-set-date="callback"></div>
```

##### input as datepicker

```html
<input type="datetime" date-time ng-model="start">
```

##### input with formatted value

```html
<input type="datetime" date-time ng-model="end" format="short">
```


##### date-range picker

```html
<div date-range start="start" end="end"></div>
```



### How to release

After a new distribution package has been pushed, a new release can be triggered with [grunt-bump](https://github.com/vojtajina/grunt-bump) :

```
grunt bump
```

You can see what the release process will do by doing a dry run :

```
grunt bump --dry-run
```
