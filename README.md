# Moneyview - SMS-to-Ledger Engine

A fintech application for parsing bank SMS messages using regex patterns.

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+

### 1. Clone
```bash
git clone https://github.com/jayantrajput-lab/BahutBdaProject.git
cd BahutBdaProject
```

### 2. Database Setup
```sql
CREATE DATABASE banking_parser;
```

### 3. Backend
```bash
cd Backend
# Update src/main/resources/application.properties with your MySQL credentials
./mvnw spring-boot:run
```
Backend runs on `http://localhost:8080`

### 4. Frontend
```bash
cd Frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

## Default Users
| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| maker | maker123 | MAKER |
| checker | checker123 | CHECKER |
| user | user123 | USER |

Run `Backend/init-mysql-data.sql` to seed these users.
