(function() {
  'use strict';

  angular.element.prototype.find = function(find){
    if (this.length) {
      return angular.element(this[0].querySelectorAll(find));
    }
    return this;
  }

})();
