# Introduction à Docker — corrigé

## Exercices du sujet

- [Gestion des conteneurs et des réseaux](exercices/CONTAINERS-RESEAUX.md)
- [Audit du quiz et comparaison DHI](dockerfile-exercice2/AUDIT.md)
- [Compose autonome du quiz sécurisé](dockerfile-exercice2/README.md)
- [Drupal avec PostgreSQL et exercice de persistance](#drupal-et-postgresql-avec-compose)

## Accueil commun

Pour l’exercice Compose « application multi-conteneurs au choix », le [Compose de déploiement](deployment/compose.yaml) rassemble les quatre applications sur une seule adresse. Nginx affiche le sélecteur et achemine les requêtes vers `/drupal/`, `/react/`, `/quiz/` et `/flask/`. Dans Dokploy, définir `POSTGRES_PASSWORD` dans l’environnement du service Compose.

Pour utiliser un domaine à toi, associe-le au service `gateway` sur le port interne `80`. Si un tunnel Cloudflare termine le HTTPS avant Traefik et transmet les requêtes à l’origine en HTTP, configure aussi `LAB_PUBLIC_HOST` avec le nom d’hôte public du TP et `LAB_TUNNEL_CIDR` avec le sous-réseau privé du connecteur.

Pour une démo publique HTTPS sans domaine, active le profil `public-preview` avec `COMPOSE_PROFILES=public-preview` dans Dokploy. Pour remplacer un domaine existant, désactive sa route dans Dokploy et retire `LAB_PUBLIC_HOST` et `LAB_TUNNEL_CIDR`. Le service `public-preview` affiche l’adresse publique dans ses journaux. Cette adresse change au redémarrage du tunnel.

Pour lancer l’accueil sur une machine de TP, publier temporairement le port de la passerelle sur la boucle locale.

Si Drupal tourne déjà via `docker compose -f docker-compose-exercice1/docker-compose.yml up -d`, exécuter `export COMPOSE_PROJECT_NAME=docker-compose-exercice1` avant les commandes ci-dessous et garder le mot de passe PostgreSQL actuel. Adapter cette valeur si le lancement d’origine utilisait `-p` ou un autre `COMPOSE_PROJECT_NAME`. La passerelle réutilise ainsi les volumes PostgreSQL et Drupal du projet existant.

```sh
export POSTGRES_PASSWORD=mot-de-passe-local-a-remplacer
docker compose -f deployment/compose.yaml up -d --build react quiz flask drupal
docker compose -f deployment/compose.yaml run --build --rm --no-deps -p 127.0.0.1:8090:80 gateway
```

Ouvrir `http://localhost:8090`. Pour une installation Drupal neuve, renseigner le mot de passe ci-dessus dans l’assistant.

Après la migration d’un site existant de `/` vers `/drupal/`, vider une fois les caches dans l’administration Drupal, sous **Configuration → Development → Performance**. Cela régénère les liens CSS et JavaScript avec le nouveau chemin.

## Images pour les trois applications

Exécuter les commandes depuis la racine du dépôt, sur une machine de TP équipée de Docker.

| Exercice | Construction | Démarrage | Adresse |
| --- | --- | --- | --- |
| [React](dockerfile-exercice1/Dockerfile) | `docker build -t tp-docker-react ./dockerfile-exercice1` | `docker run --rm -p 127.0.0.1:8088:3000 tp-docker-react` | `http://localhost:8088` |
| [Quiz Vite](dockerfile-exercice2/Dockerfile) | `docker build -t tp-docker-quiz ./dockerfile-exercice2` | `docker run --rm -p 127.0.0.1:8082:8080 tp-docker-quiz` | `http://localhost:8082` |
| [Calculateur Flask](dockerfile-exercice3/Dockerfile) | `docker build -t tp-docker-flask ./dockerfile-exercice3` | `docker run --rm -p 127.0.0.1:8083:5000 tp-docker-flask` | `http://localhost:8083` |

Dans `-p 127.0.0.1:8088:3000`, `8088` est le port de la machine et `3000` celui du conteneur. Le quiz est compilé avec Node.js, puis les fichiers générés sont servis par Nginx. Le calculateur Flask tourne avec Gunicorn. Pour vérifier les applications, ouvrir leurs pages, répondre à une question du quiz et soumettre le formulaire Flask.

### Construire, publier et retélécharger les images

[GitHub Actions](.github/workflows/publish-course-images.yml) publie et reteste les images sur GHCR. Les archives sont aussi dans la [release GitHub](https://github.com/itsaam/docker-introduction-tp/releases/latest).

| Application | Image GHCR |
| --- | --- |
| React | `ghcr.io/itsaam/tp-docker-react:1.0` |
| Quiz sécurisé | `ghcr.io/itsaam/quiz-docker:secure` |

GHCR remplace Docker Hub pour le rendu. Pour une archive, utiliser `docker load -i NOM.tar.gz`.

## Drupal et PostgreSQL avec Compose

```sh
docker compose -f docker-compose-exercice1/docker-compose.yml up -d
docker compose -f docker-compose-exercice1/docker-compose.yml ps
```

Ouvrir `http://localhost:8081`. Dans l’assistant d’installation Drupal, sélectionner **PostgreSQL**, saisir `postgres` comme nom de base et comme utilisateur, puis saisir le mot de passe de TP `drupal-tp-local`. Dans les options avancées, utiliser l’hôte `postgres` et le port `5432`. Compose résout `postgres` vers le service de base de données. Les volumes nommés conservent le contenu de la base et les fichiers propres au site. [Image Drupal](https://hub.docker.com/_/drupal), [image PostgreSQL](https://hub.docker.com/_/postgres)

## Volumes et bind mounts

Le [corrigé sur la persistance](volumes-exercices/CORRIGE.md) répond aux sept exercices et donne la procédure SQL complète de l’atelier PostgreSQL.
