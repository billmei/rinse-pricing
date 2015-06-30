$(document).ready(function() {
  "use strict";
  var GARMENTS = {
    // JavaScript doesn't have ints or else prices would be in cents.
    // I guessed the service (dry clean vs launder and press) as best as I could,
    // send in a pull request to correct it if the service is wrong.
    "bathing suit (per piece)": {
      "price": 5,
      "services": ["launder and press"],
    },
    "bed sheets": {
      "price": 15,
      "services": ["launder and press"],
    },
    "blankets": {
      "price": 15,
      "services": ["launder and press", "wash and fold"],
    },
    "blazers": {
      "price": 8,
      "services": ["dry clean"],
    },
    "blouses": {
      "price": 7,
      "services": ["launder and press"],
    },
    "coats": {
      "price": 15,
      "services": ["dry clean"],
    },
    "comforters": {
      "price": 30,
      "services": ["wash and fold"],
    },
    "comforter covers": {
      "price": 30,
      "services": ["launder and press"],
    },
    "dresses (casual)": {
      "price": 11,
      "services": ["launder and press"],
    },
    "dresses (formal)": {
      "price": 15,
      "services": ["dry clean"],
    },
    "duvets": {
      "price": 30,
      "services": ["wash and fold"],
    },
    "duvet covers": {
      "price": 30,
      "services": ["launder and press"],
    },
    "jackets (formal)": {
      "price": 8,
      "services": ["dry clean"],
    },
    "napkins": {
      "price": 1,
      "services": ["launder and press"],
    },
    "pants": {
      "price": 7,
      "services": ["launder and press"],
    },
    "pashminas": {
      "price": 7,
      "services": ["launder and press"],
    },
    "pillows": {
      "price": 10,
      "services": ["launder and press"],
    },
    "pillowcases": {
      "price": 2,
      "services": ["launder and press"],
    },
    "scarves": {
      "price": 7,
      "services": ["launder and press"],
    },
    "shawls": {
      "price": 7,
      "services": ["launder and press"],
    },
    "shirts": {
      "price": 2.5,
      "services": ["launder and press"],
    },
    "skirts": {
      "price": 7,
      "services": ["launder and press"],
    },
    "sweaters": {
      "price": 7,
      "services": ["dry clean"],
    },
    "tablecloths": {
      "price": 30,
      "services": ["launder and press"],
    },
    "ties": {
      "price": 5,
      "services": ["dry clean"],
    },
    "bath mats": {
      "price": 6,
      "services": ["wash and fold"],
    },
    "kitchen mats": {
      "price": 6,
      "services": ["wash and fold"],
    },
    "delicates" : {
      "price": 1,
      "services": ["hang dry"],
    },
    "synthetics" : {
      "price": 2.5,
      "services": ["hang dry"],
    },
    "wash and fold" : {
      "price": 1.5,
      "services": ["wash and fold"],
    },
  };
  var RUSH_FEE = 3.95;

  var GarmentModel = Backbone.Model.extend({
    defaults: {
      garment_type: '',
      cost: 0,
      quantity: 0,
      total_cost: 0,
    }
  });

  var GarmentCollection = Backbone.Collection.extend({
    model: GarmentModel,
    localStorage: new Backbone.LocalStorage('garments-manager'),

    initialize: function() {
      _.bind(this.sumCosts, this);
    },

    sumCosts: function() {
      return _.reduce(this.models, function(a,x){return a + x.get('total_cost');}, 0);
    }
  });

  var GarmentView = Backbone.View.extend({
    tagName: 'tr',
    className: 'garment',

    events: {
      'click .remove-garment': 'remove'
    },

    initialize: function() {
      _.bindAll(this, 'render', 'unrender', 'remove', 'edit');
      this.model.bind('change', this.render);
      this.model.bind('remove', this.unrender);
    },

    render: function() {
      this.$el.html(
        '<td>' + this.model.get('garment_type') + '</td>' +
        '<td>$' + Math.round10(this.model.get('cost'), -2).toFixed(2) + '</td>' +
        '<td>' + Math.round(this.model.get('quantity')) + '</td>' +
        '<td>$' + Math.round10(this.model.get('total_cost'), -2).toFixed(2) + '</td>' +
        '<td><button class="btn btn-danger remove-garment"><i class="fa fa-times"></i></button></td>'
      );
      return this;
    },

    edit: function() {

    },

    unrender: function() {
      this.$el.remove();
    },

    remove: function() {
      this.model.destroy();
      tableView.updateTotal();
    }
  });

  var TableView = Backbone.View.extend({
    el: $('#calculation-table'),

    initialize: function() {
      var self = this;
      var $garmentType = $('#garment-type');
      var $garmentQuantity = $('#garment-quantity');
      var $rushOrder = $('#rush-order');
      var $addGarment = $('#add-garment');
      var $clearAll = $('#clear-items');
      _.bindAll(this, 'render');

      this.collection = new GarmentCollection();
      this.collection.bind('add', this.appendGarment);
      // Used to fetch from localStorage
      this.collection.fetch();
      this.updateTotal();
      this.render();

      // Populate garment choices
      var sortedGarments = [];
      for (var garment in GARMENTS) {
        sortedGarments.push(garment);
      }
      sortedGarments.sort();
      for (var i = 0; i < sortedGarments.length; i++) {
        var g = sortedGarments[i];
        $garmentType.append(
          '<option value="' + g + '">' +
            g.toTitleCase() +
          '</option>'
          );
      }

      $garmentType.chosen();

      // TODO: Refactor this into an AppView to preserve the local scope
      //       and events of $el.
      $addGarment.on('click', function(event) {
        event.preventDefault();
        var garmentType = $garmentType.val();
        var garmentQuantity = parseInt($garmentQuantity.val());
        var garmentCost = parseFloat(GARMENTS[garmentType].price);

        self.addGarment.bind(self)({
          garment_type: garmentType.toTitleCase(),
          cost: garmentCost,
          quantity: garmentQuantity,
          total_cost: garmentCost * garmentQuantity,
        });
      });

      $clearAll.on('click', function(event) {
        event.preventDefault();
        self.removeAll.bind(self)();
        self.unrenderAll.bind(self)();
        self.updateTotal();
      });
    },

    updateTotal: function() {
      var totalCost = this.collection.sumCosts().toFixed(2);
      $('#grand-total').html('$' + totalCost);
      $('#total-value').html('$' + totalCost);
    },

    render: function() {
      var self = this;
      _(this.collection.models).each(function(garment){
        self.appendGarment(garment);
      }, this);
    },

    unrenderAll: function() {
      this.$el.html('');
    },

    addGarment: function(params) {
      this.collection.create(new GarmentModel(params));
      this.updateTotal();
    },

    appendGarment: function(garment) {
      var garmentView = new GarmentView({
        model: garment
      });
      var garmentEl = garmentView.render().$el;
      $('#calculation-table', this.el).append(garmentEl);
    },

    removeAll: function() {
      this.collection.reset();
    }
  });

  $('#popover-disclaimer').popover({
    'trigger' : 'hover click',
    'placement' : 'bottom',
    'content' : 'For informational purposes only; check <a href="http://www.rinse.com">rinse.com</a> for the most updated prices. This website is not affiliated with Rinse Inc.',
    'html' : true
  });

  var tableView = new TableView();
});

// Decimal rounding from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
(function() {
  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
})();

/* 
  * To Title Case 2.1 – http://individed.com/code/to-title-case/
  * Copyright © 2008–2013 David Gouch. Licensed under the MIT License.
 */

String.prototype.toTitleCase = function(){
  var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

  return this.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title){
    if (index > 0 && index + match.length !== title.length &&
      match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
      (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
      title.charAt(index - 1).search(/[^\s-]/) < 0) {
      return match.toLowerCase();
    }

    if (match.substr(1).search(/[A-Z]|\../) > -1) {
      return match;
    }

    return match.charAt(0).toUpperCase() + match.substr(1);
  });
};
