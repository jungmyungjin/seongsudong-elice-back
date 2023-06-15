YML_FILE = ./deployment/docker-compose.yml

OPT = -f $(YML_FILE)

ENV_FILE = .env


all: build_up

init:
	./deployment/tools/init.sh

build_up:
	docker-compose $(OPT) --env-file $(ENV_FILE) up --build

up :
	docker-compose $(OPT) --env-file $(ENV_FILE) up

down:
	docker-compose $(OPT) --env-file $(ENV_FILE) down

build:
	docker-compose $(OPT) --env-file $(ENV_FILE) build --no-cache

clean:
	./deployment/tools/clean.sh

ps:
	docker-compose $(OPT) --env-file $(ENV_FILE) ps
	
logs:
	docker-compose $(OPT) logs -f 


re: down clean build_up

.PHONY: up down ps