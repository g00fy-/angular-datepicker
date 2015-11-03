# AngularJS datepicker directives

#### Requirements

-  Angular v1.2+
-  MomentJS
-  Moment Timezone (If timezones are being used)

## Usage Example

[Live demo](https://rawgithub.com/g00fy-/angular-datepicker/master/app/index.html)

## New features

This fork of angular-datepicker contains several features.

### Timezone Support

* The directive will work with or without a specified timezone. 
* If the timezone is known, it can be assigned to the datepicker via the `timezone` attribute. 
* If no timezone is provided, then the local time will be used.

##### No timezone information

```html
<div date-picker></div>
```

##### Specific timezone (London, UK)

```html
<div date-picker timezone="Europe/London"></div>
```


##### Specific timezone (Hong Kong, CN)

```html
<div date-picker timezone="Asia/Hong_Kong"></div>
```


### Maximum / minimum dates:

* These attributes restrict the dates that can be selected. 
* These work differently from the original `min-date` and `max-date` attributes, which they replace. 
* The original attributes allow selecting any dates and just mark the input as invalid. 
* With these attributes, if a date in the picker is outside of the valid range, then it will not be selectable.

##### Minimum date:

```html
<input date-time min-date="minDate">
```

##### Maximum date:

```html
<input date-time max-date="maxDate">
```

##### Minimum and maximum date:

```html
<input date-time min-date="minDate" max-date="maxDate">
```

### Date format (for input fields):

* A custom format for a date can be assigned via the `format` atribute.
  * This format will be used to display the date on an input field.
  * If not provided, a default format will be used.
  * See: [format options](http://momentjs.com/docs/#/displaying/format/)

```html
<input date-time format="yyyy-MM-dd HH:mm">
```


### Callback on date change

* Adding a `date-change` attribute containing a function name will cause this function to be called when the date changes in the picker.

```html
<input date-time date-change="changeDate">
```

### Update events

* An event can be broadcast from the parent scope which will update specific pickers with new settings. The settings which can be changed are:
  * `minDate`: Earliest selectable date for this picker. Disabled if this value is falsy.
  * `maxDate`: Latest selectable date for this picker. Disabled if this value is falsy.
  * `minView`: Minimum zoom level for date/time selection. Disabled if this value is falsy.
  * `maxView`: Maximum zoom level for date/time selection. Disabled if this value is falsy.
  * `view`: Default zoom level for date/time selection. Set to default value if this value is falsy.
  * `format`: Format string used to display dates on the input field. Set to default value if this value is falsy. 
    * See: [format options](http://momentjs.com/docs/#/displaying/format/)
	* This option cannot be used on the `date-picker` directive directly, it must be used on a `date-time` input field.
* The possible for the `view`, `minView` and `maxView` fields are:
  * `year`, `month`, `date`, `hours`, `minutes`.
* The event is targeted at specific pickers using their `ID` attributes.
  * If a picker exists with the same `ID` then the information in this picker will be updated.
  * A single `ID` can be used, or an array of `ID`s

#### Create picker with ID

```html
<input date-time id="pickerToUpdate">
```

#### Update one picker.

```javascript
$scope.$broadcast('pickerUpdate', 'pickerToUpdate', {
	format: 'D MMM YYYY HH:mm',
	maxDate: maxSelectableDate, //A moment object, date object, or date/time string parsable by momentjs
	minView: 'hours',
	view: false //Use default
});
```

#### Update multiple pickers.

```javascript
$scope.$broadcast('pickerUpdate', ['pickerToUpdate', 'secondPickerToUpdate'], {
	format: 'lll'
});
```