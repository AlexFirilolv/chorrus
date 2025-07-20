Tech Spec: Chorrus Application
1. Core Technology Stack
Frontend: React

Backend: FastAPI (Python)

Database: PostgreSQL

Styling: Tailwind CSS

2. Authentication
Provider: Firebase Authentication

Method: Client-side integration. The React frontend will handle the sign-up/login flow with Firebase. The resulting JWT (ID Token) will be sent to the FastAPI backend with every authenticated API request for verification.

3. Database Management
Migrations: Alembic will be used to handle database schema migrations. This allows for version-controlled, programmatic updates to the PostgreSQL database structure as the application evolves.

4. Infrastructure & DevOps
Local Development:

Containerization: Docker & Docker Compose.

Configuration: A docker-compose.yml file will define and link the frontend, backend, and db services for a one-command local setup (docker-compose up).

Environment Variables: A .env file will be used to manage secrets and environment-specific configurations (e.g., DB connection strings, Firebase config). This file will be git-ignored.

Production Deployment:

Orchestration: Kubernetes (k3s). Manifest files (Deployments, Services, Ingress) will be created for each application component.

Hosting: Self-hosted on a local k3s server cluster.

Monitoring & Logging:

Metrics Collection: Prometheus.

Visualization: Grafana. Dashboards will be configured to display application performance and system health.

Source Control & CI/CD:

Version Control: Git.

Git Hosting: Self-hosted GitLab server.

CI/CD Pipeline: GitLab CI/CD. The .gitlab-ci.yml file will define stages for:

Lint & Test: Run static analysis and unit/integration tests.

Build: Build Docker images for the frontend and backend.

Push: Push images to the GitLab container registry.

Deploy: Apply Kubernetes manifests to the k3s cluster to roll out the new version.

5. API & Real-time Communication
Primary API: RESTful API built with FastAPI.

Live Updates: WebSockets will be used for real-time communication from the server to the client (e.g., notifying a user of a new chore assignment). This provides a more responsive experience than relying solely on REST polling.
