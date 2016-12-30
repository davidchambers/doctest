BOWER = node_modules/.bin/bower
ESLINT = node_modules/.bin/eslint --config node_modules/sanctuary-style/eslint-es3.json --env es3
REMEMBER_BOWER = node_modules/.bin/remember-bower
XYZ = node_modules/.bin/xyz --message X.Y.Z --tag X.Y.Z --repo git@github.com:davidchambers/doctest.git


.PHONY: all
all:


.PHONY: lint
lint:
	$(ESLINT) \
	  --env node \
	  --rule 'key-spacing: [off]' \
	  -- lib/command.js
	$(ESLINT) \
	  --global console \
	  --global module \
	  --global require \
	  --rule 'no-multiple-empty-lines: [error, {max: 2, maxEOF: 0}]' \
	  --rule 'no-negated-condition: [off]' \
	  --rule 'spaced-comment: [error, always, {markers: ["/"]}]' \
	  -- lib/doctest.js
	$(ESLINT) \
	  --env node \
	  --rule 'indent: [off]' \
	  -- test/index.js
	$(REMEMBER_BOWER) --exclude commander --exclude esprima --exclude jquery $(shell pwd)


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
		node_modules/esprima/dist/esprima.js \
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
