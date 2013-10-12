# AngularJS datepicker directives

#### Requirements

-  Angular v1.1.4+
-  jQuery or your own implementation of `position()` on top of `jQuery Lite`


#### Development version 

Checkout branch `dev`, run `grunt install` and `bower install`.
To build run `gunt build`

## Examples

Live demo : http://embed.plnkr.co/iVKsZL6gIuAwKbdv8M4G/preview


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
