# Conteneurs et réseaux

## Nginx, Apache et MariaDB

```sh
docker run -d --name nginx -p 127.0.0.1:80:80 nginx:1.31.8-alpine
docker run -d --name apache -p 127.0.0.1:8080:80 httpd:2.4-alpine
docker run -d --name mariadb -p 127.0.0.1:3306:3306 -e MARIADB_RANDOM_ROOT_PASSWORD=yes mariadb:11.8
docker logs mariadb 2>&1 | grep 'GENERATED ROOT PASSWORD:'
```

Nginx sur `localhost`, Apache sur `localhost:8080`. J’ai obtenu HTTP 200 sur les deux et retrouvé le mot de passe root dans le journal MariaDB.

```sh
docker stop nginx apache mariadb
docker container rm -v nginx apache mariadb
```

## Bridge par défaut et bridge dédié

```sh
docker network ls
docker run -d --name tp-reseau-a --network bridge busybox:1.37.0 sleep 600
docker run -d --name tp-reseau-b --network bridge busybox:1.37.0 sleep 600
docker exec tp-reseau-a ping -c 1 tp-reseau-b
ip=$(docker inspect -f '{{(index .NetworkSettings.Networks "bridge").IPAddress}}' tp-reseau-b)
docker exec tp-reseau-a ping -c 1 "$ip"
docker network create --driver bridge tp-bridge
docker network connect tp-bridge tp-reseau-a
docker network connect tp-bridge tp-reseau-b
docker exec tp-reseau-a ping -c 1 tp-reseau-b
docker network ls --filter driver=host
docker stop tp-reseau-a tp-reseau-b
docker container rm tp-reseau-a tp-reseau-b
docker network rm tp-bridge
```

Résultat du TP : `bridge`, `host`, `null` (`none`) et `overlay` étaient présents. Le ping par nom échoue sur le bridge par défaut, alors que le ping par IP passe. Le nom marche sur le bridge dédié. Le pilote `host` partage le réseau de la machine et Docker ne crée pas plusieurs réseaux `host` isolés. [Doc Docker](https://docs.docker.com/engine/network/drivers/bridge/)
