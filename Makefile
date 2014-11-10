BOWER = node_modules/.bin/bower
COFFEE = node_modules/.bin/coffee
XYZ = node_modules/.bin/xyz --message X.Y.Z --tag X.Y.Z --repo git@github.com:davidchambers/doctest.git --script scripts/prepublish

SRC = $(shell find src -name '*.coffee')
LIB = $(patsubst src/%.coffee,lib/%.js,$(SRC))


.PHONY: all
all: $(LIB)

lib/%.js: src/%.coffee
	$(COFFEE) --compile --output $(@D) -- $<


.PHONY: clean
clean:
	rm -f -- $(LIB)


.PHONY: lint
lint:


.PHONY: release-major release-minor release-patch
release-major release-minor release-patch:
	@$(XYZ) --increment $(@:release-%=%)


.PHONY: setup
setup:
	npm install
	$(BOWER) install
	make clean
	git update-index --assume-unchanged -- $(LIB)


.PHONY: test
test: \
		all \
		test/public/bundle.js \
		test/public/index.html \
		test/public/shared/index.coffee \
		test/public/shared/index.js \
		test/public/style.css
	$(COFFEE) test/index.coffee

test/public/bundle.js: \
		bower_components/coffee-script/extras/coffee-script.js \
		bower_components/esprima/esprima.js \
		bower_components/jquery/dist/jquery.js \
		bower_components/qunit/qunit/qunit.js \
		bower_components/ramda/ramda.js \
		bower_components/underscore/underscore.js \
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
