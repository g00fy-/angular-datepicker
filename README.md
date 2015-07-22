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
