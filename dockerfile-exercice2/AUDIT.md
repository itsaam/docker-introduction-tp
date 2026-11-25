# Audit du quiz Docker

```sh
cd dockerfile-exercice2
docker build -f Dockerfile.initial -t quiz-docker:initial .
docker build -t quiz-docker:secure .
docker image inspect quiz-docker:initial quiz-docker:secure
docker image history quiz-docker:initial
docker image history quiz-docker:secure
docker run --rm -p 127.0.0.1:8082:80 quiz-docker:initial
# Puis arrêter ce conteneur et lancer : docker compose up -d
grype db update
GRYPE_DB_AUTO_UPDATE=false grype docker:quiz-docker:initial -o json > grype-initial.json
GRYPE_DB_AUTO_UPDATE=false grype docker:quiz-docker:secure -o json > grype-secure.json
```

Relevé du 25/11/2026 sur amd64. Tailles Docker et correspondances Grype 0.121.1 avec la même base du 25/11 à 06:22 UTC.

| Image | Taille | UID | Critiques | Élevées | Moyennes | Faibles |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Quiz initial, Nginx Alpine | 102,3 Mo | 0 | 1 | 10 | 7 | 0 |
| Quiz sécurisé, Nginx Alpine Slim | 29,4 Mo | 101 | 1 | 10 | 7 | 0 |
| Quiz DHI, Nginx minimal | 14,8 Mo | 65532 | 0 | 10 | 4 | 0 |
| Atelier Node, image officielle | 344,6 Mo | 0 | 1 | 79 | 76 | 12 |
| Atelier Node, image DHI | 186,7 Mo | 1000 | 1 | 28 | 28 | 7 |

Grype compte les couples CVE–paquet. Pour les deux premières images du quiz, les correspondances concernent BusyBox, OpenSSL et zlib. Sur l’atelier Node, il relève aussi 49 négligeables et 5 inconnues avant, contre 11 et 2 après.

- Les deux Dockerfiles du quiz séparent déjà le build et l’exécution. À l’exécution, il suffit de Nginx et des fichiers compilés. La version Slim réduit la taille. Le Dockerfile fixe les versions, lance Nginx sans root et le `.dockerignore` exclut les fichiers locaux inutiles.
- Compose impose une racine en lecture seule, retire les capacités, bloque l’élévation et limite CPU, mémoire et PID. Aucun des deux conteneurs ne monte le socket Docker. J’ai testé le démarrage, l’arrêt et une réponse au quiz dans Chromium, avec et sans la passerelle.
- À refaire en production : reconstruire et rescanner après les correctifs, vérifier les dépendances du build et servir en HTTPS. Une image plus petite ou un scan moins chargé ne garantit pas l’absence de faille.

## DHI

J’ai repris le [TP Node officiel](https://github.com/dockersamples/labspace-dhi-node/blob/7059244/labspace/04-switch-to-dhi.md), compilé les deux images et vérifié la réponse `Hello World!`. Comparaison faite avec Grype. Pour le quiz, la variante DHI sert les mêmes fichiers avec un Nginx sans shell ni gestionnaire de paquets.

```sh
docker login dhi.io
docker build -f Dockerfile.dhi -t quiz-docker:dhi .
docker run --rm -p 127.0.0.1:8083:8080 quiz-docker:dhi
GRYPE_DB_AUTO_UPDATE=false grype docker:quiz-docker:dhi
```
