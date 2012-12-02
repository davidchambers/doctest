.PHONY: compile clean setup test

coffee = node_modules/.bin/coffee

compile:
	@$(coffee) --compile --output lib src

clean:
	@rm -rf node_modules
	@git checkout -- lib

setup:
	@npm install

test:
	@$(coffee) test/server
