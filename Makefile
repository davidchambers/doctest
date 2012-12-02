.PHONY: compile clean setup test

coffee = coffee

compile:
	@$(coffee) --compile --output lib src

clean:
	@rm -rf node_modules
	@git checkout -- lib

setup:
	@npm install

test:
	@node test/server
