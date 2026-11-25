# Instructions pour l'exercice

Ce repository contient une application Node.js, et vous devez la faire fonctionner dans un conteneur.

Aucune modification de l'application ne devrait être nécessaire, seules les modifications du Dockerfile dans ce répertoire sont requises.


## A savoir

- Cet exercice est simplement conçu pour vous initier aux concepts de base des Dockerfile et ne se concentre pas trop sur l'utilisation correcte de Node.js dans un conteneur. 

## Quiz sécurisé avec Compose

L’image `quiz-docker:secure` est construite depuis le Dockerfile de ce dossier et servie par Nginx sur le port interne 8080. Compose publie le port 8082 en local et redémarre le service sauf arrêt volontaire.

```sh
cd dockerfile-exercice2
docker compose up -d --build
docker compose ps
docker compose logs --tail=20 quiz-docker
curl -f http://127.0.0.1:8082/
docker compose stop
docker compose start
docker compose down
```

Dans le navigateur, ouvrir `http://localhost:8082/`, démarrer le quiz, sélectionner une réponse et valider. Pour utiliser un autre port local, définir `QUIZ_PORT` avant de lancer Compose.

Le processus Nginx s’exécute avec l’UID 101. Compose monte la racine en lecture seule et fournit un espace temporaire en mémoire pour Nginx. Il retire les capacités Linux, bloque l’acquisition de nouveaux privilèges et limite le CPU, la mémoire et le nombre de processus.

[Audit et résultats](AUDIT.md) · [Configuration Compose](docker-compose.yml)
