# AngularJS datepicker directives

#### Requirements

-  Angular v1.2+
-  MomentJS
-  Moment Timezone (If timezones are being used)

## Usage Example

[Live demo](https://rawgithub.com/DanTalash/angular-datepicker/master/app/index.html)

## New features

This fork of angular-datepicker contains several features.

### Timezone Support

* The directive will work with or without a specified timezone. 
* If the timezone is known, it can be assigned to the datepicker via the timezone attribute. 
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
* These work differently from the original min-date and max-date attributes, which they replace. 
* The original attributes allow selecting any dates and just mark the input as invalid. 
* With these attributes, if a date in the picker is outside of the valid range, then it will not be selectable.


##### Maximum date:

```html
<div date-picker max-date="maxDate"></div>
```

##### Minimum date:

```html
<div date-picker min-date="minDate"></div>
```

### Date format (for input fields):

* A custom format for a date can be assigned via the `format` atribute.
  * This format will be used to display the date on an input field.
  * If not provided, a default format will be used.

```html
<div date-picker format="yyyy-MM-dd HH:mm"></div>
```


#### Callback on date change

```html
<div date-picker date-change="changeDate"></div>
```
