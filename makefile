.PHONY: dev build start install check ci

dev:
	corepack pnpm run dev

build:
	corepack pnpm run build

start:
	corepack pnpm preview

install:
	corepack pnpm install --frozen-lockfile

# Delegates to package.json's own check rather than listing the steps again,
# so the two cannot drift the way they did when a third step was added here.
check:
	corepack pnpm run check

ci: install check build

render_example:
	mkdir -p renderer/out
	for file in renderer/examples/*.txml; do \
		[ -e "$$file" ] || continue; \
		output_file=renderer/out/$$(basename "$$file" .txml).svg; \
		corepack pnpm run render "$$file" "$$output_file"; \
	done
