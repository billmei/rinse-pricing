# Rinse Price Calculator

Estimate prices for the Rinse service. Demo: https://kortaggio.github.io/rinse-pricing

## Installation

Requires [npm](https://www.npmjs.com/), [bower](http://bower.io/), and [grunt](http://gruntjs.com/).

	git clone https://github.com/Kortaggio/rinse-pricing.git
	cd rinse-pricing
	npm install
	bower install
	grunt dev

## Run locally

(and watch filesystem for changes)

	grunt run

## Compile for production

	grunt ship

Production files will be in the `dist` directory. Push to `gh-pages` using

	git subtree push --prefix dist origin gh-pages
