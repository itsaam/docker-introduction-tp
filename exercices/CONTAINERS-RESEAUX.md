# Gestion des conteneurs et des réseaux

## Trois conteneurs en mode détaché

Sur la machine du TP, les ports 80, 8080 et 3306 doivent être libres. Les ports sont publiés sur la boucle locale afin de garder les serveurs accessibles depuis cette machine.

```sh
docker run -d --name nginx -p 127.0.0.1:80:80 nginx:1.31.8-alpine
docker run -d --name apache -p 127.0.0.1:8080:80 httpd:2.4-alpine
docker run -d --name mariadb -p 127.0.0.1:3306:3306 \
  -e MARIADB_RANDOM_ROOT_PASSWORD=yes mariadb:11.8
docker ps --filter name=nginx --filter name=apache --filter name=mariadb
docker logs mariadb 2>&1 | grep 'GENERATED ROOT PASSWORD:'
```

Ouvrir `http://localhost` pour voir la page Nginx et `http://localhost:8080` pour Apache. MariaDB génère le mot de passe root lors de l’initialisation de la base. La commande ci-dessus le lit dans les journaux. Garder cette valeur dans le terminal local.

Une fois les vérifications terminées, retirer les trois conteneurs et le volume anonyme créé pour ce test MariaDB.

```sh
docker stop nginx apache mariadb
docker container rm -v nginx apache mariadb
```

## Réseau bridge par défaut et réseau dédié

```sh
docker network ls
docker run -d --name tp-reseau-a --network bridge busybox:1.37.0 sleep 600
docker run -d --name tp-reseau-b --network bridge busybox:1.37.0 sleep 600
docker exec tp-reseau-a ping -c 1 tp-reseau-b
docker inspect --format '{{(index .NetworkSettings.Networks "bridge").IPAddress}}' tp-reseau-b
```

Le test par nom échoue sur le bridge par défaut. Refaire le test avec l’adresse IP retournée par `docker inspect` pour vérifier la connectivité. Sur un bridge créé par l’utilisateur, le DNS de Docker résout aussi le nom du conteneur.

```sh
docker network create --driver bridge tp-bridge
docker network connect tp-bridge tp-reseau-a
docker network connect tp-bridge tp-reseau-b
docker exec tp-reseau-a ping -c 1 tp-reseau-b
docker network ls --filter driver=host
docker stop tp-reseau-a tp-reseau-b
docker container rm tp-reseau-a tp-reseau-b
docker network rm tp-bridge
```

Docker fournit le réseau `host` intégré. Le pilote partage la pile réseau de la machine, donc il ne crée pas un réseau `host` séparé par application. Parmi les pilotes disponibles, `bridge` relie des conteneurs sur le même moteur, `none` les isole et `overlay` sert à relier plusieurs hôtes Docker. La liste réelle dépend du moteur et des réseaux déjà créés.

## Résultats observés

Le 25 novembre 2026, Nginx et Apache ont répondu en HTTP 200. MariaDB a généré un mot de passe root dans son journal. Les essais ont utilisé des ports locaux libres pour éviter de prendre les ports d’autres services.

Le moteur listait les pilotes `bridge`, `host`, `null` (pour `none`) et `overlay`. Sur le bridge par défaut, le ping a échoué par nom et a réussi par IP. Sur le bridge dédié, il a réussi par nom. Un réseau `host` était présent.

[Documentation sur le bridge Docker](https://docs.docker.com/engine/network/drivers/bridge/) · [Pilote host](https://docs.docker.com/engine/network/drivers/host/)
