BOWER = node_modules/.bin/bower
COFFEE = node_modules/.bin/coffee

JS_FILES = $(patsubst src/%.coffee,lib/%.js,$(shell find src -type f))


.PHONY: all
all: $(JS_FILES)

lib/%.js: src/%.coffee
	$(COFFEE) --compile --output $(@D) $<


.PHONY: clean
clean:
	rm -f $(JS_FILES)


.PHONY: release-patch release-minor release-major
VERSION = $(shell node -p 'require("./package.json").version')
release-patch: NEXT_VERSION = $(shell node -p 'require("semver").inc("$(VERSION)", "patch")')
release-minor: NEXT_VERSION = $(shell node -p 'require("semver").inc("$(VERSION)", "minor")')
release-major: NEXT_VERSION = $(shell node -p 'require("semver").inc("$(VERSION)", "major")')
release-patch: release
release-minor: release
release-major: release

.PHONY: release
release:
	sed -i '' 's!\("version": "\)[0-9.]*\("\)!\1$(NEXT_VERSION)\2!' bower.json package.json
	sed -i '' "s!\(.version = '\)[0-9.]*\('\)!\1$(NEXT_VERSION)\2!" src/doctest.coffee
	make
	git add bower.json package.json src/doctest.coffee lib/doctest.js
	git commit --message $(NEXT_VERSION)
	git tag $(NEXT_VERSION)
	@echo 'remember to run `npm publish`'


.PHONY: setup
setup:
	npm install
	$(BOWER) install


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
