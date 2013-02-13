.PHONY: all clean release setup test

PORT := 3000
bin = node_modules/.bin

all: lib/command.js lib/doctest.js

lib/%.js: src/%.coffee
	@cat $< | $(bin)/coffee --compile --stdio > $@

clean:
	@rm -rf node_modules
	@git checkout -- lib

release:
ifndef VERSION
	$(error VERSION is undefined)
endif
	@sed -i '' 's!\("version": "\)[0-9.]*\("\)!\1$(VERSION)\2!' package.json
	@sed -i '' "s!\(.version = '\)[0-9.]*\('\)!\1$(VERSION)\2!" src/doctest.coffee
	@make
	@git add package.json src/doctest.coffee lib/doctest.js
	@git commit --message $(VERSION)
	@echo 'remember to run `npm publish`'

setup:
	@npm install

test:
	@make
	@$(bin)/coffee test/cli
	@sleep 0.1 && test/open http://localhost:$(PORT) &
	@$(bin)/coffee test/server
