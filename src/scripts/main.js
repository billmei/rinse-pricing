$(document).ready(function() {
  "use strict";
  var GARMENTS = {
    // JavaScript doesn't have ints or else prices would be in cents.
    // I guessed the service (dry clean vs launder and press) as best as I could,
    // send in a pull request to correct it if the service is wrong.
    "bathing suit (per piece)": {
      "price": 5,
      "services": ["launder and press"],
      "descriptor": "piece"
    },
    "bed sheets": {
      "price": 15,
      "services": ["launder and press"],
      "descriptor": "sheet"
    },
    "blankets": {
      "price": 15,
      "services": ["launder and press", "wash and fold"],
      "descriptor": "blanket"
    },
    "blazers": {
      "price": 8,
      "services": ["dry clean"],
      "descriptor": "blazer"
    },
    "blouses": {
      "price": 7,
      "services": ["launder and press"],
      "descriptor": "blouse"
    },
    "coats": {
      "price": 15,
      "services": ["dry clean"],
      "descriptor": "coat"
    },
    "comforters": {
      "price": 30,
      "services": ["wash and fold"],
      "descriptor": "comforter"
    },
    "comforter covers": {
      "price": 30,
      "services": ["launder and press"],
      "descriptor": "cover"
    },
    "dresses (casual)": {
      "price": 11,
      "services": ["launder and press"],
      "descriptor": "dress"
    },
    "dresses (formal)": {
      "price": 15,
      "services": ["dry clean"],
      "descriptor": "dress"
    },
    "duvets": {
      "price": 30,
      "services": ["wash and fold"],
      "descriptor": "duvet"
    },
    "duvet covers": {
      "price": 30,
      "services": ["launder and press"],
      "descriptor": "cover"
    },
    "jackets (formal)": {
      "price": 8,
      "services": ["dry clean"],
      "descriptor": "jacket"
    },
    "napkins": {
      "price": 1,
      "services": ["launder and press"],
      "descriptor": "napkin"
    },
    "pants": {
      "price": 7,
      "services": ["launder and press"],
      "descriptor": "pant"
    },
    "pashminas": {
      "price": 7,
      "services": ["launder and press"],
      "descriptor": "pashmina"
    },
    "pillows": {
      "price": 10,
      "services": ["launder and press"],
      "descriptor": "pillow"
    },
    "pillowcases": {
      "price": 2,
      "services": ["launder and press"],
      "descriptor": "item"
    },
    "scarves": {
      "price": 7,
      "services": ["launder and press"],
      "descriptor": "scarf"
    },
    "shawls": {
      "price": 7,
      "services": ["launder and press"],
      "descriptor": "shawl"
    },
    "shirts": {
      "price": 2.5,
      "services": ["launder and press"],
      "descriptor": "shirt"
    },
    "skirts": {
      "price": 7,
      "services": ["launder and press"],
      "descriptor": "skirt"
    },
    "sweaters": {
      "price": 7,
      "services": ["dry clean"],
      "descriptor": "sweater"
    },
    "tablecloths": {
      "price": 30,
      "services": ["launder and press"],
      "descriptor": "item"
    },
    "ties": {
      "price": 5,
      "services": ["dry clean"],
      "descriptor": "tie"
    },
    "bath mats": {
      "price": 6,
      "services": ["wash and fold"],
      "descriptor": "mat"
    },
    "kitchen mats": {
      "price": 6,
      "services": ["wash and fold"],
      "descriptor": "mat"
    },
    "delicates" : {
      "price": 1,
      "services": ["hang dry"],
      "descriptor": "item"
    },
    "synthetics" : {
      "price": 2.5,
      "services": ["hang dry"],
      "descriptor": "item"
    },
    "wash and fold" : {
      "price": 1.5,
      "services": ["wash and fold"],
      "descriptor": "pound"
    },
  };
  var RUSH_FEE = 3.95;

  var GarmentModel = Backbone.Model.extend({
    defaults: {
      garment_type: '',
      cost: 0,
      quantity: 1,
      is_rush: false,
      hang_dry: false,
      descriptor: 'item',
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
      var is_rush = this.model.get('is_rush') ? 'Yes' : 'No';
      var hang_dry = this.model.get('hang_dry') ? 'Yes' : 'No';
      this.$el.html(
        '<td class="text-left">' + this.model.get('garment_type') + '</td>' +
        '<td>' + Math.round(this.model.get('quantity')) + '</td>' +
        '<td>$' + Math.round10(this.model.get('cost'), -2).toFixed(2) + ' per ' + this.model.get('descriptor') + '</td>' +
        '<td>' + is_rush + '</td>' +
        '<td>' + hang_dry + '</td>' +
        '<td class="text-right">$' + Math.round10(this.model.get('total_cost'), -2).toFixed(2) + '</td>' +
        '<td class="text-right"><button class="btn btn-danger remove-garment"><i class="fa fa-times"></i></button></td>'
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
      var $hangDry = $('#hang-dry');
      var $addGarment = $('#add-garment');
      var $clearAll = $('#clear-items');
      var $toggleBoxes = $('input:checkbox');
      var $rushOrderLabel = $rushOrder.parent();

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
        var gar = sortedGarments[i];
        $garmentType.append(
          '<option value="' + gar + '">' +
            gar.toTitleCase() +
          '</option>'
          );
      }

      $garmentType.chosen();

      $rushOrderLabel.popover({
        'trigger' : 'hover click',
        'placement' : 'top',
        'content' : 'This garment cannot be rushed.'
      });
      $rushOrderLabel.popover('disable');

      $garmentType.on('change', function() {
        // Only wash and fold items can be rushed
        var garment = $(this).val();
        if ($.inArray('wash and fold', GARMENTS[garment].services) > -1) {
          $rushOrder.prop('checked', false);
          $rushOrder.prop('disabled', false);
          $rushOrderLabel.removeClass('disabled');
          $rushOrderLabel.removeClass('active');
          $rushOrder.next().html('No');
          $rushOrderLabel.popover('disable');
        } else {
          $rushOrder.prop('checked', false);
          $rushOrder.prop('disabled', true);
          $rushOrderLabel.addClass('disabled');
          $rushOrder.next().html('No');
          $rushOrderLabel.popover('enable');
        }
      });

      // TODO: Refactor this into an AppView to preserve the local scope
      //       and events of $el.
      $addGarment.on('click', function(event) {
        event.preventDefault();
        var garmentType = $garmentType.val();
        var garmentQuantity = parseInt($garmentQuantity.val());
        var garmentDescriptor = GARMENTS[garmentType].descriptor;
        var garmentCost = parseFloat(GARMENTS[garmentType].price);
        var isRush = $rushOrder.prop('checked');
        var hangDry = $hangDry.prop('checked');

        self.addGarment.bind(self)({
          garment_type: garmentType.toTitleCase(),
          cost: garmentCost,
          quantity: garmentQuantity,
          is_rush: isRush,
          hang_dry: hangDry,
          descriptor: garmentDescriptor,
          total_cost: garmentCost * garmentQuantity,
        });
      });

      $clearAll.on('click', function(event) {
        event.preventDefault();
        self.removeAll.bind(self)();
        self.unrenderAll.bind(self)();
        self.updateTotal();
      });

      // Make the toggle checkboxes change from "No" to "Yes"
      $toggleBoxes.on('change', function(event) {
        event.preventDefault();
        var $this = $(this);
        var newState = 'No';

        if ($this.prop('disabled')) {
          return;
        }

        if ($this.prop('checked')) {
          newState = 'Yes';
          $this.parent().addClass('active');
        } else {
          newState = 'No';
          $this.parent().removeClass('active');
        }
        $this.next().html(newState);
      });
    },

    updateTotal: function() {
      var totalCost = this.collection.sumCosts();
      // Check if there is at least one item that is being rushed
      var willRush = false;
      _.each(this.collection.models, function(garment) {
        if (garment.get('is_rush')) {
          willRush = true;
        }
      });
      if (willRush) {
        totalCost += RUSH_FEE;
        $('#rush-fee').html('$' + RUSH_FEE.toFixed(2));
      } else {
        $('#rush-fee').html('$0.00');
      }
      $('#grand-total').html('$' + totalCost.toFixed(2));
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
      // This is done instead of this.collection.reset();
      // because we also need to delete the models in localStorage
      _.chain(this.collection.models).clone().each(function(model){
        model.destroy();
      });
    }
  });

  $('#popover-disclaimer').popover({
    'trigger' : 'hover click',
    'placement' : 'right',
    'content' : 'For informational purposes only; check <a href="http://www.rinse.com">rinse.com</a> for the most updated prices.',
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
