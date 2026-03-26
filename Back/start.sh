#!/bin/bash

# Script de démarrage du backend MyPersonalTasks
# Crée le dossier data si nécessaire et lance l'application

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Démarrage de MyPersonalTasks Backend ===${NC}"

# Aller dans le répertoire du script
cd "$(dirname "$0")"

# Créer le dossier data pour la base de données H2
if [ ! -d "data" ]; then
    echo -e "${YELLOW}Création du dossier data pour la base de données...${NC}"
    mkdir -p data
    echo -e "${GREEN}Dossier data créé.${NC}"
fi

# Vérifier si Maven est installé
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}Maven n'est pas installé. Veuillez installer Maven.${NC}"
    exit 1
fi

# Lancer l'application
echo -e "${GREEN}Lancement de l'application...${NC}"
echo -e "${YELLOW}L'application sera disponible sur: http://localhost:8080/api${NC}"
echo -e "${YELLOW}Console H2: http://localhost:8080/api/h2-console${NC}"
echo -e "${YELLOW}JDBC URL: jdbc:h2:file:./data/my_personal_tasks${NC}"
echo -e "${YELLOW}Username: sa, Password: (vide)${NC}"
echo ""

# Utiliser le profil dev par défaut
mvn spring-boot:run -Dspring-boot.run.profiles=dev
