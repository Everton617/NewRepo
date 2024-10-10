all: 

d:
	ts-node prisma/seed
	pnpm run dev


dev:
	docker-compose up -d 
	npx prisma db push
	ts-node prisma/seed
	pnpm run dev

db-down: 
	docker-compose down

restart:
	make db-down 
	make dev

build-prod:
	pnpm install 
	npm run build:prod
	npm run start

test: 
	cls
	npm run test
