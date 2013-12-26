BOWER = node_modules/.bin/bower
COFFEE = node_modules/.bin/coffee


.PHONY: all
all: lib/command.js lib/doctest.js

lib/%.js: src/%.coffee
	mkdir -p $(@D)
	cat $< | $(COFFEE) --compile --stdio > $@


.PHONY: release
release:
ifndef VERSION
	$(error VERSION is undefined)
endif
	sed -i '' 's!\("version": "\)[0-9.]*\("\)!\1$(VERSION)\2!' bower.json package.json
	sed -i '' "s!\(.version = '\)[0-9.]*\('\)!\1$(VERSION)\2!" src/doctest.coffee
	make
	git add bower.json package.json src/doctest.coffee lib/doctest.js
	git commit --message $(VERSION)
	git tag $(VERSION)
	@echo 'remember to run `npm publish`'


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
	$(COFFEE) test/index.coffee

test/public/bundle.js: \
		bower_components/coffee-script/extras/coffee-script.js \
		bower_components/escodegen/escodegen.browser.js \
		bower_components/esprima/esprima.js \
		bower_components/jquery/jquery.js \
		bower_components/qunit/qunit/qunit.js \
		bower_components/underscore/underscore.js \
		lib/doctest.js \
		test/shared/results.js
	mkdir -p $(@D)
	cat $^ > $@

test/public/style.css: bower_components/qunit/qunit/qunit.css
	mkdir -p $(@D)
	cat $^ > $@

test/public/%: test/%
	mkdir -p $(@D)
	cp $< $@
