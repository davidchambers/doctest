BOWER = node_modules/.bin/bower
JSCS = node_modules/.bin/jscs
JSHINT = node_modules/.bin/jshint
XYZ = node_modules/.bin/xyz --message X.Y.Z --tag X.Y.Z --repo git@github.com:davidchambers/doctest.git

LIB = $(wildcard lib/*.js)


.PHONY: all
all:


.PHONY: lint
lint:
	$(JSHINT) -- $(LIB) test/index.js
	$(JSCS) -- $(LIB) test/index.js


.PHONY: release-major release-minor release-patch
release-major release-minor release-patch:
	@$(XYZ) --increment $(@:release-%=%)


.PHONY: setup
setup:
	npm install
	$(BOWER) install


.PHONY: test
test: \
		test/public/bundle.js \
		test/public/index.html \
		test/public/shared/index.coffee \
		test/public/shared/index.js \
		test/public/style.css
	node --harmony -- test/index.js

test/public/bundle.js: \
		bower_components/coffee-script/extras/coffee-script.js \
		node_modules/esprima-fb/esprima.js \
		bower_components/jquery/dist/jquery.js \
		bower_components/qunit/qunit/qunit.js \
		bower_components/ramda/dist/ramda.js \
		lib/doctest.js \
		test/shared/results.js
	mkdir -p $(@D)
	cat $^ >$@

test/public/style.css: bower_components/qunit/qunit/qunit.css
	mkdir -p $(@D)
	cat $^ >$@

test/public/%: test/%
	mkdir -p $(@D)
	cp $< $@
