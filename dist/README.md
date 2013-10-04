# AngularJS datepicker directives

#### Requirements

-  Angular v1.1.4+
-  jQuery or your own implementation of `position()` on top of `jQuery Lite`

#### Installation

- link CSS & JS files
- load module via dependency array of your main ng module

```html
<!DOCTYPE html>
<html ng-app="demo">
<head>
  <link href="//rawgithub.com/g00fy-/angular-datepicker/master/dist/index.css" rel="stylesheet">
</head>
<body>
  <h1>angular-datepicker</h1>
  <input ng-model="myDate" type="datetime" date-time>
  <script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
  <script src="//code.angularjs.org/1.1.5/angular.js"></script>
  <script src="//rawgithub.com/g00fy-/angular-datepicker/master/dist/index.js"></script>
  <script>
    angular.module('demo', ['datePicker'])
  </script>
</body>
</html>
```


## Examples

Live demo : http://run.plnkr.co/Zzy29J1uOEBEeIc1/


##### defaults

```html
<div date-picker="start"></div>
```


##### year view

```html
<div date-picker="start" year></div>
```


##### month view

```html
<div date-picker="start" month></div>
```


##### only date view

```html
<div date-picker="start" date></div>
```


##### hours view

```html
<div date-picker="start" hours></div>
```


##### minutes view

```html
<div date-picker="start" minutes></div>
```


##### input as datepicker

```html
<input type="datetime" date-time ng-model="start">
```


##### input with formatted value

```html
<input type="datetime" date-time ng-model="end" hours format="short">
```


##### date-range picker

```html
<div date-range start="start" end="end"></div>
```


#### Development version

Checkout branch `dev`, run `grunt install` and `bower install`.
To build run `gunt build`
