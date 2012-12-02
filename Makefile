.PHONY: compile setup test

compile:
	@coffee --compile --output lib src

setup:
	@npm install

test:
	@node test/server
