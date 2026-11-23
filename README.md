# Introduction à Docker — corrigé

## Accueil commun

Le [Compose de déploiement](deployment/compose.yaml) rassemble les quatre applications sur une seule adresse. Nginx affiche le sélecteur et achemine les requêtes vers `/drupal/`, `/react/`, `/quiz/` et `/flask/`. Dans Dokploy, associer le domaine au service `gateway` sur son port interne `80` et définir `POSTGRES_PASSWORD` dans l’environnement du service Compose.

Pour lancer l’accueil sur une machine de TP, publier temporairement le port de la passerelle sur la boucle locale.

```sh
export POSTGRES_PASSWORD=mot-de-passe-local-a-remplacer
docker compose -f deployment/compose.yaml up -d --build react quiz flask drupal
docker compose -f deployment/compose.yaml run --rm --no-deps -p 127.0.0.1:8090:80 gateway
```

Ouvrir `http://localhost:8090`. Pour une installation Drupal neuve, renseigner le mot de passe ci-dessus dans l’assistant.

## Images pour les trois applications

Exécuter les commandes depuis la racine du dépôt, sur une machine de TP équipée de Docker.

| Exercice | Construction | Démarrage | Adresse |
| --- | --- | --- | --- |
| [React](dockerfile-exercice1/Dockerfile) | `docker build -t tp-docker-react ./dockerfile-exercice1` | `docker run --rm -p 127.0.0.1:8088:3000 tp-docker-react` | `http://localhost:8088` |
| [Quiz Vite](dockerfile-exercice2/Dockerfile) | `docker build -t tp-docker-quiz ./dockerfile-exercice2` | `docker run --rm -p 127.0.0.1:8082:80 tp-docker-quiz` | `http://localhost:8082` |
| [Calculateur Flask](dockerfile-exercice3/Dockerfile) | `docker build -t tp-docker-flask ./dockerfile-exercice3` | `docker run --rm -p 127.0.0.1:8083:5000 tp-docker-flask` | `http://localhost:8083` |

Dans `-p 127.0.0.1:8088:3000`, `8088` est le port de la machine et `3000` celui du conteneur. Le quiz est compilé avec Node.js, puis les fichiers générés sont servis par Nginx. Le calculateur Flask tourne avec Gunicorn. Pour vérifier les applications, ouvrir leurs pages, répondre à une question du quiz et soumettre le formulaire Flask.

### Tester le téléchargement depuis Docker Hub

Remplacer `VOTRE_COMPTE` par son espace de noms Docker Hub. Arrêter le conteneur React lancé ci-dessus avec Ctrl+C avant de relancer le test sur le même port.

```sh
docker login
docker tag tp-docker-react VOTRE_COMPTE/tp-docker-react:1.0
docker push VOTRE_COMPTE/tp-docker-react:1.0
```

Vérifier le tag `1.0` dans son dépôt Docker Hub. Retirer les deux tags locaux de l’image, puis relancer le conteneur depuis Docker Hub et rouvrir `http://localhost:8088`.

```sh
docker image rm tp-docker-react VOTRE_COMPTE/tp-docker-react:1.0
docker run --rm -p 127.0.0.1:8088:3000 VOTRE_COMPTE/tp-docker-react:1.0
```

## Drupal et PostgreSQL avec Compose

```sh
docker compose -f docker-compose-exercice1/docker-compose.yml up -d
docker compose -f docker-compose-exercice1/docker-compose.yml ps
```

Ouvrir `http://localhost:8081`. Dans l’assistant d’installation Drupal, sélectionner **PostgreSQL**, saisir `postgres` comme nom de base et comme utilisateur, puis saisir le mot de passe de TP `drupal-tp-local`. Dans les options avancées, utiliser l’hôte `postgres` et le port `5432`. Compose résout `postgres` vers le service de base de données. Les volumes nommés conservent le contenu de la base et les fichiers propres au site. [Image Drupal](https://hub.docker.com/_/drupal), [image PostgreSQL](https://hub.docker.com/_/postgres)

## Volumes et bind mounts

Le [corrigé sur la persistance](volumes-exercices/CORRIGE.md) répond aux sept exercices et donne la procédure SQL complète de l’atelier PostgreSQL.
