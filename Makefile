.PHONY: compile setup test

compile:
	@coffee --compile --output lib src

setup:
	@npm install express

test:
	@node test/server
