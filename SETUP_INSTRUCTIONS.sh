#!/bin/bash
# QUICK SETUP: Copy these files to your backend and you're done!
# All files are ready to use - just copy to correct locations

echo "Backend Email & WhatsApp Communication Setup"
echo "=============================================="
echo ""
echo "Step 1: Copy these files to your backend:"
echo "  - EmailConfig.java → src/main/java/com/itc/demo/config/"
echo "  - CommunicationService.java → src/main/java/com/itc/demo/service/"
echo "  - CommunicationServiceImpl.java → src/main/java/com/itc/demo/service/impl/"
echo "  - CommunicationController.java → src/main/java/com/itc/demo/controller/"
echo ""
echo "Step 2: Update these files:"
echo "  - application.yml (add SMTP config)"
echo "  - DonorRepository.java (add query method)"
echo "  - AppealController.java (if needed)"
echo ""
echo "Step 3: Add to pom.xml:"
echo "  - spring-boot-starter-mail"
echo ""
echo "All Java files are in IMPLEMENTATION_FILES folder"
