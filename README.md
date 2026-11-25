# TP Docker

## Lancer le TP

Depuis la racine du dépôt, avec Docker Compose :

```sh
export POSTGRES_PASSWORD=mot-de-passe-tp
docker compose -f deployment/compose.yaml up -d --build react quiz flask drupal
docker compose -f deployment/compose.yaml run --build --rm --no-deps -p 127.0.0.1:8090:80 gateway
```

Ouvrir [localhost:8090](http://localhost:8090) pour accéder à React, au quiz, à Flask et à Drupal. Dans l’assistant Drupal, choisir PostgreSQL, saisir `postgres` pour l’hôte, la base et l’utilisateur, puis le mot de passe défini ci-dessus.

Pour réutiliser une installation Drupal, garder le mot de passe et définir `COMPOSE_PROJECT_NAME` au nom du projet d’origine. Après un passage de `/` à `/drupal/`, vider le cache de Drupal.

Quitter la passerelle avec Ctrl+C, puis arrêter les services :

```sh
docker compose -f deployment/compose.yaml down
```

## Lancer une application seule

```sh
docker run --rm -p 127.0.0.1:8088:3000 ghcr.io/itsaam/tp-docker-react:1.0
docker run --rm -p 127.0.0.1:8082:8080 ghcr.io/itsaam/quiz-docker:secure
docker build -t tp-docker-flask ./dockerfile-exercice3
docker run --rm -p 127.0.0.1:8083:5000 tp-docker-flask
```

React : [8088](http://localhost:8088) · Quiz : [8082](http://localhost:8082) · Flask : [8083](http://localhost:8083). Les [archives des images](https://github.com/itsaam/docker-introduction-tp/releases/latest) s’importent avec `docker load -i NOM.tar.gz`.

## Exercices

- [Conteneurs et réseaux](exercices/CONTAINERS-RESEAUX.md)
- [Compose du quiz](dockerfile-exercice2/README.md) · [Audit et DHI](dockerfile-exercice2/AUDIT.md)
- [Compose Drupal](docker-compose-exercice1/README.md) · [Volumes et persistance](volumes-exercices/CORRIGE.md)
