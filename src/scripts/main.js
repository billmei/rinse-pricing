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
			quantity: 0,
			cost: 0,
			total_cost: 0,
		}
	});

	var GarmentCollection = Backbone.Collection.extend({
		model: GarmentModel,
		localStorage: new Backbone.LocalStorage('garments-manager'),

		initialize: function() {
		    _.bind(this.totalCost, this);
		},

		totalCost: function() {
			return this.reduce(function(a, x) {
				return a + x.get('total_cost');
			});
		}
	});

	var GarmentView = Backbone.View.extend({
		tagName: 'tr',
		className: 'garment',

		events: {

		},

		initialize: function() {
			_.bindAll(this, 'render', 'unrender', 'remove', 'edit');
			this.model.bind('change', this.render);
			this.model.bind('remove', this.unrender);
		},

		render: function() {
			this.$el.html(
				'<td>' + this.model.get('garment_type') + '</td>' +
				'<td>' + Math.round(this.model.get('quantity')) + '</td>' +
				'<td>' + Math.round10(this.model.get('cost'), -2) + '</td>' +
				'<td>' + Math.round10(this.model.get('total_cost'), -2) + '</td>'
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
			_.bindAll(this, 'render');

			this.collection = new GarmentCollection();
			this.collection.bind('add', this.appendGarment);
			// Used to fetch from localStorage
			this.collection.fetch();
			this.render();

			$('#add-garment').on('click', function(event) {
				event.preventDefault();
				self.addGarment(self);
			});
		},

		render: function() {
			var self = this;
			_(this.collection.models).each(function(garment){
				self.appendGarment(garment);
			}, this);
		},

		addGarment: function(self) {
			self.collection.create(new GarmentModel());
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
		'content' : 'For informational purposes only; check rinse.com for the most updated prices. This website is not affiliated with Rinse Inc.'
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
