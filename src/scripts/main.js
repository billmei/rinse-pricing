$(document).ready(function() {
  "use strict";
  var GARMENTS = {
    // JavaScript doesn't have ints or else this would be in cents.
    "bathing suit (per piece)": 5,
    "bed sheet": 15,
    "blanket": 15,
    "blazer": 8,
    "blouse": 7,
    "coat": 15,
    "comforter": 30,
    "dress (casual)": 11,
    "dress (formal)": 15,
    "duvet cover": 30,
    "jacket (formal)": 8,
    "napkin": 1,
    "pants": 7,
    "pashmina": 7,
    "pillow": 10,
    "pillowcase": 2,
    "scarf": 7,
    "shawl": 7,
    "shirt": 2.5,
    "skirt": 7,
    "sweater": 7,
    "tablecloth": 30,
    "tie": 5,
    "bath mat": 6,
    "kitchen mat": 6,
    "delicates" : 1,
    "synthetics" : 2.5,
    "wash and fold" : 1.5
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
        '<td><button class="remove-garment"><i class="fa fa-times"></i></button></td>'
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
      _.bindAll(this, 'render');

      this.collection = new GarmentCollection();
      this.collection.bind('add', this.appendGarment);
      // Used to fetch from localStorage
      this.collection.fetch();
      this.render();

      $garmentType.chosen();

      $addGarment.on('click', function(event) {
        event.preventDefault();
        var garmentType = $garmentType.val();
        var garmentQuantity = parseInt($garmentQuantity.val());
        var garmentCost = parseFloat(GARMENTS[garmentType]);
        garmentType.toTitleCase();

        self.addGarment.bind(self)({
          garment_type: garmentType,
          cost: garmentCost,
          quantity: garmentQuantity,
          total_cost: garmentCost * garmentQuantity,
        });

        self.updateTotal.bind(self)();
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

    addGarment: function(params) {
      this.collection.create(new GarmentModel(params));
    },

    appendGarment: function(garment) {
      var garmentView = new GarmentView({
        model: garment
      });
      var garmentEl = garmentView.render().$el;
      $('#calculation-table', this.el).append(garmentEl);
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
