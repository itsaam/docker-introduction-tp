# Audit du quiz Docker

## Reproduire le relevé

`Dockerfile.initial` conserve le Dockerfile du quiz avant cet exercice. Il construisait déjà le site avec Node et servait le résultat avec Nginx. La comparaison vise les images finales exécutées, sur la même architecture et avec la même base Grype.

```sh
cd dockerfile-exercice2
docker build -f Dockerfile.initial -t quiz-docker:initial .
docker compose build quiz-docker
docker image inspect quiz-docker:initial quiz-docker:secure \
  --format '{{index .RepoTags 0}} {{.Os}}/{{.Architecture}} {{.Size}} {{json (index .Config "User")}}'
docker image history --no-trunc quiz-docker:initial
docker image history --no-trunc quiz-docker:secure
grype db update
GRYPE_DB_AUTO_UPDATE=false grype docker:quiz-docker:initial -o json > grype-initial.json
GRYPE_DB_AUTO_UPDATE=false grype docker:quiz-docker:secure -o json > grype-secure.json
docker run --rm -p 127.0.0.1:8082:80 quiz-docker:initial
# Arrêter l'image initiale avant de tester Compose sur le même port.
docker compose up -d
docker compose ps
docker compose down
```

## Avant et après durcissement

| Critère | Image initiale | Image sécurisée et Compose |
| --- | --- | --- |
| Base de compilation | `node:22-alpine`, tag mobile | Node 22 et Alpine avec version et digest |
| Base d’exécution | `nginx:alpine`, tag mobile | Nginx 1.31.10 Alpine Slim avec digest |
| Couches | Base Nginx et copie du site compilé | Base Nginx, configuration dédiée et copie du site compilé |
| Node et npm en production | Absents | Absents |
| Build en plusieurs étapes et copie sélective | Oui | Oui |
| Contexte de build | Pas de `.dockerignore` | Secrets locaux, dépendances générées et fichiers de rendu exclus |
| Privilèges Nginx | Le maître est lancé en root par défaut | Maître et workers sous UID/GID 101 |
| Système de fichiers | Racine en écriture par défaut | Racine en lecture seule, écritures Nginx dans un tmpfs borné |
| Capacités Linux et élévation de privilèges | Réglages Docker par défaut | Toutes les capacités retirées et `no-new-privileges` |
| Ressources | Pas de limite spécifique | 0,5 CPU, 128 Mio, 32 PID |
| Socket Docker | Aucun montage | Aucun montage |
| Taille mesurée | 69 077 632 octets (65,88 Mio) | 18 944 838 octets (18,07 Mio) |
| Critiques (correspondances Grype) | 1 | 1 |
| Élevées | 10 | 10 |
| Moyennes | 7 | 7 |
| Faibles | 0 | 0 |

Relevé du 25 novembre 2026 sur `linux/amd64` avec Grype 0.121.1 et la base construite à 06:22:21 UTC. Les totaux comptent les couples vulnérabilité–paquet. Par exemple, une même CVE repérée dans `libcrypto3` et `libssl3` compte deux fois. Les deux images ont les mêmes 18 correspondances dans BusyBox, OpenSSL et zlib. Ces résultats de scanner ne montrent pas quelle vulnérabilité est atteignable dans le quiz.

| Sévérité | Paquets | Identifiants relevés sur les deux images |
| --- | --- | --- |
| Critique | `zlib` | CVE-2026-4738 |
| Élevée | `libcrypto3`, `libssl3` | CVE-2026-107493, CVE-2026-107494, CVE-2026-121482, CVE-2026-124709, CVE-2026-84786 |
| Moyenne | `libcrypto3`, `libssl3` | CVE-2026-35190, CVE-2026-95690 |
| Moyenne | `busybox`, `busybox-binsh`, `ssl_client` | CVE-2025-60876 |

Les fichiers compilés, Nginx et ses bibliothèques suffisent à l’exécution. La variante Alpine Slim réduit la taille d’environ 73 % par rapport à l’image initiale, qui était déjà multi-étape. Le Dockerfile définit la base, les fichiers copiés, l’utilisateur et la commande. Compose impose les limites, le montage temporaire et la politique de redémarrage. Le gain du durcissement vient notamment du retrait des capacités, de l’utilisateur non-root et de la racine en lecture seule.

Le scan des images finales ne couvre pas tout le poste de compilation ni le moteur Docker. En production, il faut reconstruire avec les correctifs, rescanner périodiquement, examiner les dépendances de compilation et servir le trafic en HTTPS. Un résultat Grype dépend de sa base de vulnérabilités et de ce qu’il sait inventorier dans les images.

## Variante Docker Hardened Images

Le lien de l’énoncé renvoie une 404. Les étapes restent dans le [dépôt officiel de l’atelier Node](https://github.com/dockersamples/labspace-dhi-node/blob/main/labspace/04-switch-to-dhi.md). L’atelier compare Node 24 sur Debian slim à une compilation avec `dhi.io/node:24-debian13-dev` et une exécution avec `dhi.io/node:24-debian13`. Le registre exige une authentification, même avec les [images Community](https://docs.docker.com/dhi/how-to/use/).

Le quiz est un site statique. Sa variante `Dockerfile.dhi` utilise le Node DHI de développement pour Vite et un Nginx DHI minimal pour servir `dist/`. Le Nginx DHI du catalogue fonctionne avec l’UID 65532 sur le port 8080 et sa variante d’exécution ne contient ni shell ni gestionnaire de paquets. L’image Nginx Alpine du quiz sécurisé conserve ceux de la distribution. Il faut mesurer taille et vulnérabilités sur l’image construite avant de conclure à un gain chiffré.

```sh
docker login dhi.io
docker build -f Dockerfile.dhi -t quiz-docker:dhi .
docker run --rm -p 127.0.0.1:8083:8080 quiz-docker:dhi
docker image inspect quiz-docker:dhi --format '{{.Size}} {{json (index .Config "User")}}'
GRYPE_DB_AUTO_UPDATE=false grype docker:quiz-docker:dhi -o json > grype-dhi.json
```

[Catalogue Nginx DHI](https://hub.docker.com/hardened-images/catalog/dhi/nginx/guides) · [Analyse des résultats Grype](https://oss.anchore.com/docs/guides/vulnerability/)
