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

render_example:
	mkdir -p renderer/out
	for file in renderer/examples/*.txml; do \
		[ -e "$$file" ] || continue; \
		output_file=renderer/out/$$(basename "$$file" .txml).svg; \
		corepack pnpm run render "$$file" "$$output_file"; \
	done
