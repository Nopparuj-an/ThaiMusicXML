.PHONY: dev build start install check ci

dev:
	corepack pnpm run dev

build:
	corepack pnpm run build

start:
	corepack pnpm start

install:
	corepack pnpm install --frozen-lockfile

check:
	corepack pnpm run check:links
	corepack pnpm run check:corpus

ci: install check build
