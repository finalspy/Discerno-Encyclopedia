---
slug: benfords-law
type: concept
lang: fr
title: Loi de Benford
summary: "Dans beaucoup de séries de nombres réels, le premier chiffre est plus souvent 1 que 9, selon une répartition précise."
status: in-review
themes: [laws-and-adages, statistics-and-data]
related: [texas-sharpshooter, cherry-picking, misleading-graphs]
classifications:
  wikipedia: ["Benford's_law"]
references:
  - title: A Statistical Derivation of the Significant-Digit Law
    author: Theodore P. Hill
    year: 1995
    doi: 10.1214/ss/1177009869
  - title: "Benford's Law and the Detection of Election Fraud"
    author: Joseph Deckert, Mikhail Myagkov, Peter C. Ordeshook
    year: 2011
    doi: 10.1093/pan/mpr014
open_issues:
  - kind: unverified
    note: "Fiche rédigée sans relecture humaine : les travaux cités et leur description restent à contrôler sur les textes."
---
## Définition

Observée par Simon Newcomb en 1881 puis par Frank Benford en 1938, la loi dit que, dans de nombreuses séries (longueurs de fleuves, populations, montants comptables), le premier chiffre vaut 1 dans environ 30 % des cas et 9 dans moins de 5 %. Hill (1995) en donne une explication mathématique.

Statut : une régularité mathématique, valable seulement pour certaines séries, en général celles qui s'étendent sur plusieurs ordres de grandeur.

## Définitions concurrentes et débats

La loi sert à repérer des anomalies, par exemple en audit comptable. Mais un écart à la loi n'est pas une preuve de fraude : beaucoup de séries honnêtes ne la suivent pas. Deckert, Myagkov et Ordeshook (2011) montrent qu'elle est au mieux problématique pour détecter des fraudes électorales, dans un sens comme dans l'autre : ni la conformité ni l'écart ne permettent de conclure.

## Pourquoi cela aide à discerner

Un test statistique cité comme preuve doit être adapté aux données. Avant d'accepter « ces chiffres ne suivent pas la loi de Benford, donc ils sont truqués », demander si ces chiffres devaient la suivre.
