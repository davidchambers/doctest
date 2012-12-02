.PHONY: compile setup test

compile:
	@node_modules/coffee-script/bin/coffee --compile --output lib src

setup:
	@npm install

test:
	@node test/server
