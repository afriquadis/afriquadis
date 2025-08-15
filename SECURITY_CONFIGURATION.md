# 🔒 Configuration de Sécurité AFRIQUADIS

## 📋 Vue d'ensemble de la sécurité

L'application AFRIQUADIS a été entièrement sécurisée avec des mesures de protection avancées contre les vulnérabilités courantes.

## 🛡️ Mesures de sécurité implémentées

### 1. **NextAuth.js Sécurisé**

#### Configuration des sessions
- **Stratégie JWT** avec expiration automatique (24h)
- **Mise à jour de session** toutes les 30 minutes
- **Cookies sécurisés** avec flags httpOnly, secure, sameSite
- **Protection CSRF** intégrée

#### Authentification robuste
- **Validation stricte** des entrées avec Zod
- **Hachage bcrypt** (12 rounds de sel)
- **Verrouillage de compte** après 5 tentatives échouées
- **Rate limiting** par IP
- **Nettoyage XSS** automatique des entrées

#### Gestion des erreurs
- **Logs de sécurité** détaillés
- **Messages d'erreur génériques** (pas d'exposition d'informations sensibles)
- **Gestion gracieuse** des sessions expirées

### 2. **Middleware de Sécurité**

#### Protection des routes
- **Routes protégées** : `/admin`, `/account`, `/cart`, `/diagnostic/final-results`
- **Routes d'authentification** : `/login`, `/register`
- **Redirection automatique** vers la connexion

#### En-têtes de sécurité
- **X-Frame-Options: DENY** - Protection contre le clickjacking
- **X-Content-Type-Options: nosniff** - Protection MIME
- **X-XSS-Protection: 1; mode=block** - Protection XSS navigateur
- **Strict-Transport-Security** - Force HTTPS
- **Content-Security-Policy** - Protection contre les injections
- **Permissions-Policy** - Contrôle des permissions

### 3. **Prisma Sécurisé**

#### Validation des données
- **Schémas de validation** par modèle (user, order, message, bilan)
- **Nettoyage automatique** des paramètres
- **Détection d'injection SQL** avec patterns suspects
- **Limitation de longueur** des entrées

#### Monitoring de sécurité
- **Métriques de sécurité** en temps réel
- **Logs d'événements** de sécurité
- **Détection de requêtes** suspectes
- **Gestion des erreurs** sécurisée

### 4. **API Routes Sécurisées**

#### Route d'inscription (`/api/register`)
- **Validation Zod** stricte côté serveur
- **Rate limiting** par IP (5 tentatives/minute)
- **Verrouillage temporaire** après dépassement
- **Nettoyage XSS** des données
- **Validation des mots de passe** (complexité requise)
- **Rejet des mots de passe** communs
- **Logs de sécurité** complets

#### Protection contre les attaques
- **Injection SQL** - Prisma ORM + validation
- **XSS** - Nettoyage automatique + CSP
- **CSRF** - NextAuth + tokens
- **Brute force** - Rate limiting + verrouillage
- **Enumération** - Messages d'erreur génériques

## 🔧 Configuration requise

### Variables d'environnement

```bash
# Obligatoire
NEXTAUTH_SECRET=votre-secret-super-securise-32-caracteres-minimum
DATABASE_URL=postgresql://user:pass@host:port/db

# Recommandé
ADMIN_TOKEN=token-admin-securise
NODE_ENV=production
```

### Génération du secret NextAuth

```bash
# Générer un secret sécurisé
openssl rand -base64 32

# Ou utiliser une chaîne aléatoire
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚨 Bonnes pratiques de sécurité

### 1. **Mots de passe**
- Minimum 8 caractères
- Au moins une minuscule, une majuscule, un chiffre, un caractère spécial
- Pas de mots de passe communs
- Rotation régulière recommandée

### 2. **Sessions**
- Déconnexion automatique après inactivité
- Pas de stockage de données sensibles côté client
- Validation des tokens à chaque requête

### 3. **Données**
- Validation stricte côté serveur
- Nettoyage automatique des entrées
- Chiffrement des données sensibles
- Logs d'audit complets

## 📊 Monitoring de sécurité

### Métriques disponibles
- **Tentatives de connexion** échouées
- **Requêtes suspectes** détectées
- **Erreurs de validation** rejetées
- **Temps de traitement** des requêtes

### Logs de sécurité
- **Connexions réussies/échouées**
- **Tentatives d'inscription** suspectes
- **Erreurs de validation** détaillées
- **Activité administrative**

## 🔍 Tests de sécurité

### Tests automatisés
```bash
# Tests de sécurité NextAuth
npm test auth.security.test.ts

# Tests de validation Prisma
npm test prisma.security.test.ts

# Tests d'API sécurisées
npm test api.security.test.ts
```

### Tests manuels
- **Injection XSS** : `<script>alert('xss')</script>`
- **Injection SQL** : `' OR 1=1 --`
- **CSRF** : Tentative de requête sans token
- **Brute force** : Tentatives multiples de connexion

## 🚀 Déploiement sécurisé

### Production
1. **Variables d'environnement** sécurisées
2. **HTTPS obligatoire** avec certificats valides
3. **Base de données** isolée et sécurisée
4. **Monitoring** en temps réel
5. **Backups** chiffrés et sécurisés

### Environnement de développement
1. **Secrets de développement** uniquement
2. **Base de données** locale ou isolée
3. **Logs détaillés** pour le debugging
4. **Tests de sécurité** réguliers

## 📚 Ressources de sécurité

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NextAuth.js Security](https://next-auth.js.org/configuration/security)
- [Prisma Security](https://www.prisma.io/docs/guides/security)

### Outils de test
- [OWASP ZAP](https://owasp.org/www-project-zap/)
- [Burp Suite](https://portswigger.net/burp)
- [Nmap](https://nmap.org/)

## ⚠️ Avertissements importants

### Responsabilité
- Ce système est un **outil d'aide au diagnostic**
- Il **ne remplace pas** une consultation médicale
- Les résultats doivent être **validés par un professionnel**

### Sécurité
- **Changez tous les secrets** par défaut
- **Surveillez les logs** de sécurité
- **Mettez à jour régulièrement** les dépendances
- **Testez la sécurité** avant chaque déploiement

---

*Configuration de sécurité mise à jour le : ${new Date().toLocaleDateString('fr-FR')}*
*Version de sécurité : 2.0.0*
*Statut : ✅ Sécurisé et prêt pour la production*
