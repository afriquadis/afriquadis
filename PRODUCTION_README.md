# 🚀 AFRIQUADIS - Guide de Déploiement en Production

## 📋 Prérequis

- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Nginx
- Certificats SSL

## 🔧 Configuration de Production

### 1. Variables d'Environnement

Copiez `env.production` vers `.env.local` et configurez :

```bash
# Base de données
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL=https://votre-domaine.com
NEXTAUTH_SECRET=votre-secret-securise

# Services externes
NEXT_PUBLIC_OPENAI_API_KEY=votre-cle-openai
STRIPE_SECRET_KEY=votre-cle-stripe
```

### 2. Base de Données

```bash
# Génération du client Prisma
npm run db:generate

# Migration de la base
npm run db:migrate

# Seed des données (optionnel)
npm run db:seed
```

### 3. Build de Production

```bash
# Nettoyage et build
npm run production:build

# Démarrage en production
npm run production:start
```

## 🐳 Déploiement Docker

### 1. Construction

```bash
# Build de l'image
npm run docker:build

# Démarrage des services
npm run docker:production
```

### 2. Vérification

```bash
# Vérification de la santé
npm run health:check

# Audit de sécurité
npm run security:audit
```

## 📊 Monitoring

- **Grafana** : http://localhost:3001
- **Prometheus** : http://localhost:9090
- **Health Check** : /api/health

## 🔒 Sécurité

- Headers de sécurité configurés
- Rate limiting activé
- CORS restreint
- Validation des entrées
- Audit des dépendances

## 🚀 Déploiement Automatique

```bash
# Script de déploiement complet
./deploy.sh production
```

## 📱 Génération APK

Pour la génération d'APK, utilisez :

```bash
# Build de production
npm run production:build

# Export statique
npm run export

# L'APK sera généré dans le dossier mobile/
```

## ✅ Checklist de Production

- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] Build de production réussi
- [ ] Tests de sécurité passés
- [ ] Monitoring configuré
- [ ] SSL configuré
- [ ] Sauvegarde configurée
- [ ] Logs configurés
- [ ] Performance optimisée

## 🆘 Support

En cas de problème :
1. Vérifiez les logs : `docker-compose logs app`
2. Vérifiez la santé : `/api/health`
3. Consultez le monitoring
4. Contactez l'équipe technique

---

**AFRIQUADIS - Système de Diagnostic Médical Intelligent**
*Version Production - 2024*
