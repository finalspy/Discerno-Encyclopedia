---
slug: base-rate-neglect
type: bias
lang: fr
title: Oubli de la fréquence de base
synonyms: [négligence du taux de base, base rate fallacy]
summary: On juge la probabilité d'un cas d'après sa description ou un indice frappant, en ignorant la fréquence réelle de ce cas dans la population.
status: in-review
themes: [cognitive-biases, statistics-and-data]
related: [availability-heuristic, conjunction-fallacy, survivorship-bias]
classifications:
  wikipedia: [Base_rate_fallacy]
references:
  - title: On the psychology of prediction
    author: Daniel Kahneman, Amos Tversky
    year: 1973
    doi: 10.1037/h0034747
  - title: The base-rate fallacy in probability judgments
    author: Maya Bar-Hillel
    year: 1980
    doi: 10.1016/0001-6918(80)90046-3
open_issues:
  - kind: unverified
    note: Titres, auteurs et années vérifiés sur Crossref ; le protocole « ingénieurs et avocats » reste à contrôler sur l'article de 1973.
---
## Comment ça marche

Kahneman et Tversky (1973) présentent des descriptions de personnes tirées d'un groupe composé d'ingénieurs et d'avocats. Que le groupe compte 30 % ou 70 % d'ingénieurs change peu les réponses : les participants se fient à la ressemblance entre la description et le stéréotype du métier.

Un exemple chiffré, inventé pour illustrer le calcul : une maladie touche 1 personne sur 1 000, et un test la détecte presque toujours, avec 1 % de faux positifs. Sur 1 000 personnes testées, on compte environ 1 vrai positif et 10 faux positifs. Un test positif correspond donc à une probabilité d'être malade d'environ 9 %, pas de 99 %.

## Pourquoi c'est problématique

Un indicateur peut sembler très fiable tout en produisant surtout de fausses alertes quand le phénomène recherché est rare. Un chiffre présenté sans le taux de base peut alors faire paraître une menace, un risque ou une preuve bien plus forts qu'ils ne le sont.

## Comment le détecter

- Un taux de réussite ou un pourcentage est donné sans la fréquence du phénomène.
- Un portrait ou un récit très parlant sert à conclure qu'un cas est probable.
- Une comparaison est faite en valeurs absolues entre des groupes de tailles très différentes.

## Comment s'en protéger

- Demander toujours : « Sur combien ? » et « Quelle est la fréquence habituelle ? »
- Refaire le calcul en effectifs sur 1 000 ou 10 000 personnes, plus lisibles que les pourcentages.
- Distinguer la probabilité d'avoir un indice quand on a le cas, et la probabilité d'avoir le cas quand on a l'indice.
