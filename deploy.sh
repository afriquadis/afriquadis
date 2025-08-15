#!/bin/bash

# Script de déploiement de production AFRIQUADIS
# Usage: ./deploy.sh [production|staging]

set -e

# Configuration
ENVIRONMENT=${1:-production}
APP_NAME="afriquadis-bilan-express"
VERSION=$(date +%Y%m%d_%H%M%S)
DOCKER_REGISTRY="afriquadis"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    log_success "Tous les prérequis sont satisfaits"
}

# Nettoyage de l'environnement
cleanup() {
    log "Nettoyage de l'environnement..."
    
    # Arrêt des conteneurs existants
    docker-compose -f docker-compose.production.yml down --remove-orphans || true
    
    # Nettoyage des images
    docker image prune -f
    
    # Nettoyage des volumes non utilisés
    docker volume prune -f
    
    log_success "Environnement nettoyé"
}

# Construction de l'application
build_app() {
    log "Construction de l'application..."
    
    # Nettoyage des builds précédents
    npm run clean
    
    # Installation des dépendances
    npm ci --only=production
    
    # Génération du client Prisma
    npm run db:generate
    
    # Build de production
    NODE_ENV=production npm run build
    
    log_success "Application construite avec succès"
}

# Construction de l'image Docker
build_docker() {
    log "Construction de l'image Docker..."
    
    # Construction de l'image de production
    docker build -f Dockerfile.production -t ${DOCKER_REGISTRY}/${APP_NAME}:${VERSION} .
    docker tag ${DOCKER_REGISTRY}/${APP_NAME}:${VERSION} ${DOCKER_REGISTRY}/${APP_NAME}:latest
    
    log_success "Image Docker construite: ${DOCKER_REGISTRY}/${APP_NAME}:${VERSION}"
}

# Déploiement de la base de données
deploy_database() {
    log "Déploiement de la base de données..."
    
    # Application des migrations
    npm run db:migrate
    
    log_success "Base de données déployée"
}

# Déploiement de l'application
deploy_app() {
    log "Déploiement de l'application..."
    
    # Démarrage des services
    docker-compose -f docker-compose.production.yml up -d
    
    # Attente du démarrage
    log "Attente du démarrage des services..."
    sleep 30
    
    # Vérification de la santé
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Application déployée et accessible"
    else
        log_error "L'application n'est pas accessible"
        exit 1
    fi
}

# Vérification de la sécurité
security_check() {
    log "Vérification de la sécurité..."
    
    # Audit des dépendances
    npm audit --audit-level=high || log_warning "Vulnérabilités détectées dans les dépendances"
    
    # Vérification des ports exposés
    if netstat -tuln | grep -q ":3000 "; then
        log_success "Port 3000 accessible"
    else
        log_error "Port 3000 non accessible"
    fi
    
    log_success "Vérifications de sécurité terminées"
}

# Tests de performance
performance_test() {
    log "Tests de performance..."
    
    # Test de charge simple
    if command -v ab &> /dev/null; then
        ab -n 100 -c 10 http://localhost:3000/ > performance_test.log 2>&1
        log_success "Test de performance terminé"
    else
        log_warning "Apache Bench non installé, tests de performance ignorés"
    fi
}

# Sauvegarde
backup() {
    log "Sauvegarde de l'environnement..."
    
    # Sauvegarde de la base de données
    docker exec afriquadis-postgres-prod pg_dump -U afriquadis_prod afriquadis_production > backup_${VERSION}.sql
    
    # Sauvegarde des logs
    tar -czf logs_backup_${VERSION}.tar.gz logs/ 2>/dev/null || true
    
    log_success "Sauvegarde créée: backup_${VERSION}.sql, logs_backup_${VERSION}.tar.gz"
}

# Fonction principale
main() {
    log "=== DÉPLOIEMENT AFRIQUADIS - ENVIRONNEMENT: ${ENVIRONMENT} ==="
    
    check_prerequisites
    cleanup
    build_app
    build_docker
    deploy_database
    deploy_app
    security_check
    performance_test
    backup
    
    log_success "=== DÉPLOIEMENT TERMINÉ AVEC SUCCÈS ==="
    log "Application accessible sur: http://localhost:3000"
    log "Grafana accessible sur: http://localhost:3001"
    log "Prometheus accessible sur: http://localhost:9090"
}

# Gestion des erreurs
trap 'log_error "Erreur lors du déploiement. Vérifiez les logs."; exit 1' ERR

# Exécution
main "$@"
