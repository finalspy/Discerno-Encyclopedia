---
slug: insensitivity-to-sample-size
type: bias
lang: fr
title: "Insensibilité à la taille de l'échantillon"
summary: "On juge un résultat sans tenir compte du nombre de cas observés, alors que les petits échantillons varient beaucoup plus."
status: in-review
themes: [cognitive-biases, statistics-and-data]
related: [hasty-generalization, base-rate-neglect]
classifications:
  wikipedia: [Insensitivity_to_sample_size]
references:
  - title: "Judgment under uncertainty: Heuristics and biases"
    author: "Amos Tversky, Daniel Kahneman"
    year: 1974
    doi: 10.1126/science.185.4157.1124
  - title: Belief in the law of small numbers
    author: "Amos Tversky, Daniel Kahneman"
    year: 1971
    doi: 10.1037/h0031322
open_issues:
  - kind: unverified
    note: "Fiche rédigée sans relecture humaine : les travaux cités et leur description restent à contrôler sur les textes."
---
## Comment ça marche

Dans un problème de Tversky et Kahneman (1974), on demande quel hôpital, petit ou grand, enregistre le plus de jours avec plus de 60 % de naissances de garçons. Beaucoup répondent que c'est pareil, alors que le petit hôpital s'écarte davantage de la moyenne.

## Pourquoi c'est problématique

Un résultat spectaculaire vient souvent d'un petit échantillon, justement parce que les petits échantillons produisent plus de valeurs extrêmes.

## Comment le détecter

- Un pourcentage est donné sans le nombre de cas.
- Les extrêmes d'un classement sont de petites entités.

## Comment s'en protéger

- Demander toujours le nombre de cas, et la marge d'erreur.
- Se méfier des pourcentages impressionnants calculés sur peu de personnes.
