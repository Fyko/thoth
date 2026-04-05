default:
	just --list
	
# "build": "turbo run build --cache-dir=.turbo",
# 		"build:affected": "turbo run build --filter='...[origin/main]' --concurrency=4",
# 		"dev:bot": "turbo run dev --filter bot --cache-dir=.turbo",
# 		"dev:web": "turbo run dev --filter web --cache-dir=.turbo",
# 		"lint": "turbo run lint --concurrency=4 --cache-dir=.turbo",
# 		"format": "turbo run format --concurrency=4 --cache-dir=.turbo"

build:
	turbo run build --cache-dir=.turbo

build-affected:
	turbo run build --filter='...[origin/main]' --concurrency=4

dev-bot:
	turbo run dev --filter bot --cache-dir=.turbo

dev-web:
	turbo run dev --filter web --cache-dir=.turbo

lint:
	turbo run lint --cache-dir=.turbo

format:
	turbo run format --cache-dir=.turbo

alias fmt := format
