.PHONY: compile clean setup test

PORT := 3000
coffee = node_modules/.bin/coffee

compile:
	@$(coffee) --compile --output lib src

clean:
	@rm -rf node_modules
	@git checkout -- lib

setup:
	@npm install

test:
	@$(coffee) test/cli
	@sleep 0.1 && test/open http://localhost:$(PORT) &
	@$(coffee) test/server
