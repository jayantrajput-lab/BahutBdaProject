# Moneyview - SMS-to-Ledger Engine

A fintech application for parsing bank SMS messages using regex patterns. Built with Spring Boot backend and React frontend.

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- Maven 3.8+

### 1. Clone the Repository
```bash
git clone https://github.com/jayantrajput-lab/BahutBdaProject.git
cd BahutBdaProject
```

### 2. Database Setup
```sql
CREATE DATABASE banking_parser;
```

### 3. Backend Setup
```bash
cd Backend

# Update MySQL credentials in src/main/resources/application.properties
# spring.datasource.username=your_username
# spring.datasource.password=your_password

# Run the application
./mvnw spring-boot:run
# OR if mvnw not available:
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`

### 4. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:8081`

### 5. Seed Default Users (Optional)
```bash
mysql -u root -p banking_parser < Backend/init-mysql-data.sql
```

---

## 👥 Default Users

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| maker | maker123 | MAKER |
| checker | checker123 | CHECKER |
| user | user123 | USER |

---

## 📁 Project Structure

```
project_bahut_bada/
├── Backend/                    # Spring Boot Application
│   ├── src/main/java/com/bankingparser/
│   │   ├── controller/         # REST API Controllers
│   │   ├── service/            # Business Logic
│   │   ├── repository/         # JPA Repositories
│   │   ├── model/              # Entity Classes
│   │   ├── dto/                # Data Transfer Objects
│   │   ├── security/           # JWT Authentication
│   │   └── config/             # Security Config
│   └── src/main/resources/
│       └── application.properties
├── Frontend/                   # React + Vite Application
│   ├── src/
│   │   ├── pages/              # Dashboard Pages
│   │   ├── components/         # UI Components
│   │   ├── stores/             # Zustand State Management
│   │   └── services/           # API Services
│   └── public/
└── README.md
```

---

## ✨ Features

- **User Dashboard**: Parse SMS, view transaction history, bulk SMS parsing
- **Maker Dashboard**: Create regex patterns, save drafts, submit for approval
- **Checker Dashboard**: Review, approve/reject patterns with modifications
- **Admin Dashboard**: View user counts, create new users
- **Auto Category Detection**: LLM-powered merchant categorization (Groq API)
- **Dark/Light Theme**: Toggle between themes
- **JWT Authentication**: Secure role-based access control

---

## 🤖 How We Used AI

### Cursor Usage

Cursor AI (Claude) was extensively used for implementing various features of this project:

| Feature | How Cursor Helped |
|---------|-------------------|
| **Regex Pattern Generation** | Generated backend-compatible regex patterns for 15+ different SMS formats (HDFC, SBI, Axis, Kotak, etc.) with proper named groups |
| **Maker/Checker Dashboard** | Built the complete pattern lifecycle - draft, pending, approved, rejected, failed states |
| **Bulk SMS Parsing** | Implemented backend endpoint and frontend UI for processing multiple SMS messages |
| **Merchant Category Service** | Created the auto-detection system with database lookup and Groq LLM API fallback |
| **Theme Implementation** | Added dark/light mode toggle with CSS variables and Zustand store |
| **Login Page Redesign** | Split-screen layout with image and form, responsive design |
| **Transaction History** | Filters by category (food, health, shopping) and type (debit/credit) |
| **CORS Configuration** | Debugged and fixed complex CORS issues with Spring Security |
| **Database Schema Updates** | Added new columns (reference_no, available_balance, sms_title) with proper migrations |

**Example Prompt Used:**
> "In userdashboard's transaction section can we add filters? First is get by category: food, health etc. Second debits, third credits and if no filter then all transactions will be shown."

### Qodo Usage

Qodo was used to improve code quality through automated testing:

| Area | How Qodo Helped |
|------|-----------------|
| **JUnit Tests** | Generated comprehensive test cases for all 5 controllers |
| **Test Coverage** | Created 60+ test cases covering success, failure, and edge cases |
| **Security Tests** | Added authorization tests to verify role-based access control |
| **Mock Configuration** | Set up proper MockMvc and @MockBean configurations |

**Controllers Tested:**
- `AuthControllerTest` - Signup/Login validation
- `AdminControllerTest` - User management authorization
- `MakerControllerTest` - Pattern CRUD operations
- `CheckerControllerTest` - Approval workflow
- `UserControllerTest` - Transaction and bulk parsing

### Lessons Learned

1. **Be Specific with Context**: Instead of asking "fix my code", providing the exact error message and relevant code snippet saved significant debugging time.

2. **Iterative Prompting Works Best**: Breaking down complex features into smaller prompts (e.g., first implement the backend, then the frontend, then connect them) produced better results than asking for everything at once.

3. **Include Examples**: When asking for regex patterns, providing sample SMS messages with expected extractions led to accurate patterns on the first try.

4. **State the Constraints**: Mentioning "don't affect existing functionality" or "keep the current styling" prevented unnecessary changes.

**Time-Saving Tip:**
> When debugging, paste the exact error from console along with the relevant code. This helped Cursor identify issues like the token storage key mismatch (`token` vs `auth-token`) immediately.

---

## 🔧 Running Tests

```bash
cd Backend

# Run all tests
mvn test

# Run with coverage report
mvn clean test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

---

## 🛠️ Tech Stack

**Backend:**
- Spring Boot 3.2
- Spring Security + JWT
- Spring Data JPA
- MySQL
- Groq API (LLM)

**Frontend:**
- React 18
- Vite
- Zustand (State Management)
- Tailwind CSS
- Shadcn/ui Components

---

## 📝 License

This project is for educational purposes.
