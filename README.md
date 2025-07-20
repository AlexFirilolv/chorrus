# Chorrus - Household Task Manager

A fullstack web application for managing household chores and tasks among roommates, couples, and families.

## Features

- **Household Management**: Create and manage private households with invite codes
- **Chore Creation**: Create one-time or recurring chores with due dates
- **Task Assignment**: Assign chores to specific household members or use automatic round-robin assignment
- **Progress Tracking**: Mark chores as complete and view completion history
- **Real-time Updates**: Live notifications for new assignments and status changes
- **Mobile-friendly**: Responsive design for all devices

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Primary database
- **SQLAlchemy** - ORM for database operations
- **Alembic** - Database migrations
- **Firebase Auth** - Authentication service
- **Docker** - Containerization

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Firebase SDK** - Authentication integration

### Infrastructure
- **Docker Compose** - Local development
- **Kubernetes** - Production orchestration (k3s)
- **GitLab CI/CD** - Continuous integration and deployment
- **Prometheus** - Monitoring
- **Grafana** - Metrics visualization

## Quick Start

### Local Development with Docker Compose

1. **Clone the repository**
   ```bash
   git clone https://gitlab.com/your-org/chorrus.git
   cd chorrus
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Database: localhost:5432

### Manual Setup

#### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up database**
   ```bash
   alembic upgrade head
   ```

3. **Run the server**
   ```bash
   uvicorn app.main:app --reload
   ```

#### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```

## Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/chorrus

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-key-here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# API Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env)
```bash
# Firebase
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# API
REACT_APP_API_URL=http://localhost:8000
```

## API Documentation

The API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

- `POST /api/v1/households/` - Create new household
- `GET /api/v1/households/{id}` - Get household details
- `POST /api/v1/households/{id}/invites` - Generate invite code
- `POST /api/v1/households/join` - Join household with invite code
- `POST /api/v1/chores/` - Create new chore
- `GET /api/v1/chores/` - Get household chores
- `GET /api/v1/chores/my-chores` - Get user's assigned chores
- `POST /api/v1/chores/{id}/complete` - Mark chore as complete

## Database Schema

### Core Tables
- **users**: User authentication and profile data
- **households**: Household information and admin management
- **chores**: Task details and scheduling
- **chore_assignments**: User-chore relationship and completion status

## Deployment

### Production Environment

1. **Kubernetes Setup**
   ```bash
   kubectl apply -f kubernetes/namespace.yaml
   kubectl apply -f kubernetes/
   ```

2. **Using Helm (optional)**
   ```bash
   helm install chorrus ./helm/chorrus
   ```

### GitLab CI/CD

The project includes a complete GitLab CI/CD pipeline:
- **Test Stage**: Backend and frontend testing
- **Build Stage**: Docker image building and pushing
- **Deploy Stage**: Kubernetes deployment

## Development

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Testing

```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm test
```

### Code Quality

```bash
# Backend linting
cd backend
black .
flake8 .

# Frontend linting
cd frontend
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact [support@chorrus.com](mailto:support@chorrus.com) or create an issue in the GitLab repository.