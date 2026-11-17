# Nafsity — plateforme de bien-être mental (version locale de développement)

Next.js 14 (App Router) · TypeScript · Tailwind · Prisma · PostgreSQL · React Hook Form + Zod · Recharts · Lucide.
Langues : français (défaut), arabe (RTL) et anglais pour l'interface ; **le contenu en base (exercices, défis, inspirations, bios) est en français**.

## Démarrage

```bash
npm install
cp .env.example .env          # puis changez AUTH_SECRET
npm run db:up                 # PostgreSQL via Docker Compose
npm run db:push               # crée les tables
npm run db:seed               # données FICTIVES + index anti double-réservation
npm run dev                   # http://localhost:3000
npm test                      # tests unitaires (créneaux, crise, validation, fuseau)
```

## Comptes de démonstration (fictifs) — mot de passe `Demo1234!`
| Rôle | Email |
|---|---|
| Utilisateur | user@demo.nafsity.test |
| Psychologue | psy1@demo.nafsity.test (aussi psy2, psy3) |
| Administrateur | admin@demo.nafsity.test |

Les liens de vérification d'email et de réinitialisation de mot de passe sont **affichés dans la console du serveur** (aucun fournisseur d'email configuré).

## Parcours rapide
1. Connectez-vous en `user@…` → « Mon abonnement » → choisir une formule → paiement **simulé**.
2. « Psychologues » → un profil → choisir une date et un créneau libre → réserver.
3. Connectez-vous en `psy1@…` (`/pro`) → Rendez-vous → Confirmer. Modifiez les disponibilités dans `/pro/availability`.
4. `admin@…` (`/admin`) → marquer un psychologue « Vérifié » (le badge n'apparaît qu'après cette action).

## Décisions de conception
- **Politique de séances** : 1 séance décomptée à la réservation ; restituée si annulation ≥ 24 h avant, ou refus/annulation par le psychologue.
- **Double réservation** : transaction `Serializable` + recalcul des créneaux dans la transaction + index unique partiel SQL (créé par le seed).
- **Fuseau** : Africa/Tunis (UTC+1 fixe, pas d'heure d'été).
- **Changement de formule** : nouvelle période de 30 jours, nouveau quota ; l'ancienne souscription est clôturée.
- **Paiements** : simulation uniquement, aucune donnée bancaire collectée.
- **Vie privée** : journal et notes d'humeur uniquement lisibles par leur propriétaire (requêtes filtrées par `userId`) ; l'admin et les psychologues n'ont aucune requête vers ces tables ; notes de consultation visibles seulement du psychologue concerné ; export JSON et suppression de compte (cascade) disponibles.
- **Assistant** : fournisseur à base de règles (`src/lib/assistant.ts`) avec interface `AssistantProvider` prête pour un LLM/RAG ; détection de situations de crise (FR/EN/AR) ; aucune donnée de journal ou d'humeur transmise.

## Limites connues (honnêteté)
- Code non exécuté ni testé de bout en bout dans l'environnement de génération (pas de PostgreSQL ni de téléchargement du moteur Prisma). Prévoir un premier passage de correction après `npm install` / `npm run dev`.
- shadcn/ui n'est pas installé : composants Tailwind maison. Pas de tests E2E ni de tests de permissions automatisés (seulement des tests unitaires).
- Pas de photo de profil/stockage de fichiers, pas d'envoi d'emails, pas de rappels programmés (cron), pas d'envoi de notifications d'inspiration à heure choisie (préférence enregistrée seulement).
- Base de connaissances de l'assistant éditable par l'admin : non implémentée. Édition des messages d'inspiration : création et activation/désactivation seulement.
- Rate limiting en mémoire (à remplacer en production). Pas d'avis/notes (le modèle `Review` existe, sans interface).
- Vidéo : champ `videoRoomId` réservé, aucune fonctionnalité.
- Les numéros d'urgence (190, 197, 198) sont à vérifier localement. Faire valider juridiquement la confidentialité (RGPD / loi tunisienne) avant tout usage avec de vraies données.
- Logo : `public/brand/logo-original.jpg` est le visuel fourni (« نفسيتي ») ; l'interface utilise un logo SVG provisoire « Nafsity نفسيتي ». À remplacer par une version vectorielle.
