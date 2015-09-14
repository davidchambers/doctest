ESLINT = node_modules/.bin/eslint --config node_modules/sanctuary-style/eslint-es3.json --env node
XYZ = node_modules/.bin/xyz --message X.Y.Z --tag X.Y.Z --repo git@github.com:davidchambers/doctest.git


.PHONY: all
all:


.PHONY: lint
lint:
	$(ESLINT) \
	  --rule 'key-spacing: [off]' \
	  -- lib/command.js
	$(ESLINT) \
	  --rule 'no-multiple-empty-lines: [error, {max: 2, maxEOF: 0}]' \
	  --rule 'spaced-comment: [error, always, {markers: ["/"]}]' \
	  -- lib/doctest.js
	$(ESLINT) \
	  --rule 'max-len: [off]' \
	  -- test/index.js


.PHONY: release-major release-minor release-patch
release-major release-minor release-patch:
	@$(XYZ) --increment $(@:release-%=%)


.PHONY: setup
setup:
	npm install


.PHONY: test
test:
	node -- test/index.js
