# Corrigé des exercices sur la persistance

## 1. Couche inscriptible

Le premier conteneur affiche `Donnee-temporaire` et le second affiche `ABSENT`. Le fichier appartient à la couche inscriptible du premier conteneur, détruite avec celui-ci. Chaque nouveau conteneur repart de l’image avec sa propre couche inscriptible. Cette perte pose problème pour des données à conserver, comme une base, des fichiers envoyés par les utilisateurs ou des journaux d’audit.

## 2. Inspection du volume nommé

| Champ | Valeur ou signification |
| --- | --- |
| `Name` | `tp-volume` |
| `Driver` | Le pilote de stockage, généralement `local` |
| `Mountpoint` | Le chemin où le moteur Docker stocke les données du volume |
| `Scope` | La portée du volume, généralement `local`, sur ce moteur Docker |

Avec Docker Desktop, le moteur Linux tourne généralement dans une machine virtuelle. Le point de montage appartient à son système de fichiers. Le volume a sa propre durée de vie et peut être utilisé par plusieurs conteneurs. [Volumes Docker](https://docs.docker.com/engine/storage/volumes/)

## 3. Persistance après suppression

Le second conteneur affiche `Donnee-persistante`. Dans l’exercice 1, le fichier était stocké dans la couche du conteneur supprimé. Ici, `/data` pointe vers `tp-volume` et le volume porte la durée de vie du fichier.

## 4. Partage entre conteneurs

Le lecteur affiche `Message-du-conteneur-A`, puis `Message-modifie`. Les deux conteneurs voient les mêmes fichiers. Le montage `readonly` empêche le lecteur de modifier le volume. Des écritures concurrentes sans coordination peuvent écraser une modification ou produire des données incohérentes.

## 5. Bind mount avec Nginx

Le conteneur lit directement les fichiers du dossier local `site-web`. Après enregistrement de l’édition et actualisation de la page, Nginx sert la version 2. Le type de montage affiché est `bind`. Avec `readonly`, Nginx peut lire les fichiers et l’éditeur sur l’hôte peut toujours les modifier. Le fichier reste sur l’hôte après suppression du conteneur. [Bind mounts Docker](https://docs.docker.com/engine/storage/bind-mounts/)

## 6. Choix du montage

Nginx sans montage affiche sa page d’accueil fournie par l’image, tandis que l’instance avec un bind mount affiche le contenu de `site-web`.

| Situation | Choix | Justification |
| --- | --- | --- |
| Faire persister des fichiers de base de données | Volume nommé | Docker gère le stockage et la base peut remonter le même volume. |
| Voir instantanément les modifications d’un site HTML local | Bind mount | Le conteneur lit le dossier édité sur l’hôte. |
| Exécuter une application temporaire sans données à conserver | Aucun montage | La couche inscriptible suffit pendant l’exécution. |
| Conserver des données lors de la recréation d’un conteneur | Volume nommé | Le même volume peut être monté dans le nouveau conteneur. |

Docker choisit l’emplacement du volume nommé. Avec un bind mount, on indique le chemin source sur l’hôte. Les deux montages permettent de conserver les données après remplacement du conteneur. Une sauvegarde ajoute une copie indépendante à restaurer après une suppression, une corruption ou une panne du stockage.

## 7. Suppression ciblée

Après suppression de `tp-nettoyage`, son inspection renvoie une erreur. Le volume recréé est vide et `important.txt` a disparu. `docker volume prune --all` peut également supprimer des volumes nommés inutilisés d’autres projets. Avant une suppression en production, identifier les consommateurs du volume et vérifier qu’une sauvegarde récente peut être restaurée. [Nettoyage des volumes Docker](https://docs.docker.com/reference/cli/docker/volume/prune/)

## Atelier PostgreSQL 17

Les commandes multilignes ci-dessous utilisent Bash ou Zsh. Sous PowerShell, écrire `docker run` sur une seule ligne, sans les barres obliques inverses, puis saisir les requêtes SQL dans une session ouverte avec `docker exec -it tp-postgres psql -v ON_ERROR_STOP=1 -U tpuser -d tpdb`. Quitter la session avec `\q`.

Sur une machine de TP, créer le volume et vérifier que son pilote est `local`.

```sh
docker volume create tp-postgres-data
docker volume inspect --format '{{.Driver}}' tp-postgres-data
```

Démarrer PostgreSQL avec le montage attendu par l’image 17. Relancer `pg_isready` jusqu’à ce que le serveur accepte les connexions. L’option `-h 127.0.0.1` vérifie le serveur TCP depuis l’intérieur du conteneur. [Image officielle PostgreSQL](https://hub.docker.com/_/postgres)

```sh
docker run -d --name tp-postgres \
  --mount type=volume,source=tp-postgres-data,target=/var/lib/postgresql/data \
  -e POSTGRES_USER=tpuser \
  -e 'POSTGRES_PASSWORD=TpDocker2026!' \
  -e POSTGRES_DB=tpdb \
  postgres:17
docker ps --filter name=tp-postgres
docker exec tp-postgres pg_isready -h 127.0.0.1 -U tpuser -d tpdb
```

Créer la table et vérifier les lignes avant le remplacement.

```sh
docker exec -i tp-postgres psql -v ON_ERROR_STOP=1 -U tpuser -d tpdb <<'SQL'
CREATE TABLE apprenants (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    formation VARCHAR(100) NOT NULL
);

INSERT INTO apprenants (nom, formation)
VALUES ('Alice', 'Docker'), ('Bilal', 'DevOps'), ('Chloe', 'Cloud');

SELECT * FROM apprenants ORDER BY id;
SQL
```

Arrêter et retirer le conteneur, puis confirmer que le volume existe encore.

```sh
docker stop tp-postgres
docker rm tp-postgres
docker volume inspect tp-postgres-data
```

Reprendre la même commande `docker run`, attendre que `pg_isready` réussisse, puis relire les données.

```sh
docker exec tp-postgres psql -U tpuser -d tpdb -c 'SELECT * FROM apprenants ORDER BY id;'
```

Résultat vérifié avant et après le remplacement le 25 novembre 2026. Le nouveau conteneur avait un identifiant différent, utilisait le même volume nommé et a renvoyé exactement les trois mêmes lignes.

| id | nom | formation |
| --- | --- | --- |
| 1 | Alice | Docker |
| 2 | Bilal | DevOps |
| 3 | Chloe | Cloud |

1. Les fichiers de PostgreSQL restent dans `tp-postgres-data` et le nouveau conteneur retrouve ce répertoire.
2. Un volume vide entraîne l’initialisation d’une base neuve. La table `apprenants` reste dans l’ancien volume.
3. Une corruption, une suppression du volume ou une panne du stockage peut faire perdre les données. Une sauvegarde indépendante et testée permet de les restaurer.
4. Les fichiers internes peuvent être incompatibles entre versions majeures. Il faut prévoir une migration, par exemple avec `pg_upgrade` ou une exportation suivie d’une restauration.
5. Un bind mount est pertinent quand l’équipe doit placer les fichiers dans un répertoire précis de l’hôte, par exemple sur un disque dédié, et maîtrise ses permissions.
