
SHELL:=/bin/bash

.PHONY: all
all: check bin/pointless

.PHONY: pub
pub:
	pub get

.PHONY: check
check: pub
	-dartanalyzer lib/pointless.dart

.PHONY: dev
dev: check bin/pointless
	
bin/pointless: makefile lib/*/*.dart
	dart2native lib/pointless.dart -o bin/pointless
