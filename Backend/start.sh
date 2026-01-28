#!/bin/bash

# Banking Message Parser - Quick Start Script
# This script helps you quickly start the application

echo "================================================"
echo "  Banking Message Parser - Quick Start"
echo "================================================"
echo ""

# Check if Java is installed
echo "Checking Java installation..."
if command -v java &> /dev/null
then
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
    echo "✅ Java found: $JAVA_VERSION"
else
    echo "❌ Java not found. Please install Java 17 or higher."
    exit 1
fi

# Check if Maven is installed
echo "Checking Maven installation..."
if command -v mvn &> /dev/null
then
    MVN_VERSION=$(mvn -version | head -n 1)
    echo "✅ Maven found: $MVN_VERSION"
else
    echo "❌ Maven not found. Please install Maven 3.6 or higher."
    echo "   Install with: brew install maven (macOS)"
    exit 1
fi

echo ""
echo "================================================"
echo "  Building the project..."
echo "================================================"
echo ""

# Build the project
mvn clean install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "================================================"
    echo "  Starting the application..."
    echo "================================================"
    echo ""
    echo "Application will start on: http://localhost:8080"
    echo "H2 Console: http://localhost:8080/h2-console"
    echo ""
    echo "Press Ctrl+C to stop the application"
    echo ""
    
    # Run the application
    mvn spring-boot:run
else
    echo ""
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi
