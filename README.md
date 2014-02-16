# AngularJS datepicker directives

## WIP

#### Requirements

-  Angular v1.2+


#### Development version 

Checkout, run `grunt install` and `bower install`.
To build run `gunt build`

## Examples

[Live demo](https://rawgithub.com/g00fy-/angular-datepicker/master/app/index.html)


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

##### calendar with events
```html
<calendar view="date" event-source="CalendarEvents"></calendar>
```
