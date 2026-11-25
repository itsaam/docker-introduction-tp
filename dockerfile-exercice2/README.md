# Instructions pour l'exercice

Ce repository contient une application Node.js, et vous devez la faire fonctionner dans un conteneur.

Aucune modification de l'application ne devrait être nécessaire, seules les modifications du Dockerfile dans ce répertoire sont requises.


## A savoir

- Cet exercice est simplement conçu pour vous initier aux concepts de base des Dockerfile et ne se concentre pas trop sur l'utilisation correcte de Node.js dans un conteneur. 

## Quiz sécurisé avec Compose

```sh
cd dockerfile-exercice2
docker compose up -d --build
docker compose ps
docker compose logs quiz-docker
docker compose stop
docker compose start
docker compose down
```

Ouvrir `http://localhost:8082/`. Le port interne est 8080. [Audit du quiz](AUDIT.md)
