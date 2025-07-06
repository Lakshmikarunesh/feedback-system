# Lightweight Feedback System

A complete full-stack web application for structured feedback sharing between managers and employees. Built with modern technologies and designed for production use.

# Demo Link 
https://youtu.be/CNg_sKcBfFY

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript, Tailwind CSS |
| Backend | Python FastAPI |
| Database | SQLite |
| Authentication | Mocked login (hardcoded users) |
| Charts | Recharts |
| Deployment | Docker support |

## ✨ Features

### 🔐 Authentication & Roles
- **Two user roles**: Manager and Employee
- **Mocked login system** with predefined users (no signup required)
- **Role-based access control** for both frontend and backend
- **Secure session management** with localStorage

### 📝 Feedback Management
- **Managers can submit feedback** for their team members
- **Structured feedback format**:
  - Strengths (text area)
  - Areas to improve (text area)  
  - Overall sentiment (positive/neutral/negative)
- **Edit and update** existing feedback
- **Timestamp tracking** for all submissions

### 👀 Feedback Viewing
- **Managers**: View and edit all feedback they've submitted
- **Employees**: View only their own feedback
- **Acknowledgment system**: Employees can acknowledge individual feedback items
- **Timeline view** with sentiment indicators

### 📊 Dashboards

#### Manager Dashboard
- Team member overview with feedback counts
- Sentiment distribution pie chart
- Feedback per team member bar chart
- Recent feedback timeline
- Key metrics: Total feedback, acknowledged items, monthly activity

#### Employee Dashboard  
- Personal feedback timeline
- Acknowledgment status tracking
- Monthly feedback summary
- Visual sentiment indicators

### 🔧 Technical Features
- **Responsive design** - works on mobile, tablet, and desktop
- **Real-time updates** with optimistic UI updates
- **Loading states** and error handling
- **Clean, intuitive UI** with Tailwind CSS
- **TypeScript** for type safety
- **Modular architecture** with separation of concerns

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Python 3.11+
- Docker (optional, for containerized backend)

### Frontend Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Start the development server**:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

3. **Run the FastAPI server**:
```bash
python app.py
```

Or using uvicorn directly:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Docker Setup (Backend Only)

1. **Build the Docker image**:
```bash
docker build -t feedback-backend .
```

2. **Run the container**:
```bash
docker run -p 8000:8000 feedback-backend
```

The API will be available at `http://localhost:8000`

## 👥 Demo Users

The system comes with pre-configured demo users:

### Managers
- **manager1** / password123 - Alice Johnson
- **manager2** / password123 - Bob Smith

### Employees  
- **employee1** / password123 - Charlie Brown (reports to Alice)
- **employee2** / password123 - Diana Wilson (reports to Alice)
- **employee3** / password123 - Eve Davis (reports to Bob)
- **employee4** / password123 - Frank Miller (reports to Bob)

## 🏗️ Project Structure

```
project-root/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React Context providers
│   │   ├── pages/           # Route components
│   │   └── App.tsx          # Main application component
│   ├── package.json
│   └── ...
├── backend/                 # FastAPI application
│   ├── app.py              # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── feedback.db         # SQLite database (auto-created)
├── Dockerfile              # Docker configuration for backend
└── README.md               # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /login` - Authenticate user with basic auth

### Team Management  
- `GET /team` - Get team members (managers only)

### Feedback Operations
- `GET /feedback` - Get feedback (filtered by role)
- `POST /feedback` - Create new feedback (managers only)
- `PUT /feedback/{id}` - Update existing feedback (managers only)
- `POST /feedback/{id}/acknowledge` - Acknowledge feedback (employees only)

### Analytics
- `GET /analytics` - Get dashboard analytics (managers only)

## 🔒 Security Features

- **Role-based access control** at API level
- **Input validation** with Pydantic models
- **SQL injection prevention** with parameterized queries
- **CORS configuration** for cross-origin requests
- **Authentication required** for all protected endpoints

## 📱 Responsive Design

The application is fully responsive with breakpoints for:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🎨 Design System

- **Color scheme**: Blue primary, with green/yellow/red for sentiment
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable UI components with hover states
- **Animations**: Subtle transitions and loading states

## 🚦 How Login Works

1. **Frontend**: User enters credentials on login form
2. **Basic Auth**: Credentials encoded as base64 for HTTP Basic Auth
3. **Backend**: FastAPI validates against hardcoded user database
4. **Session**: Valid credentials stored in localStorage for subsequent requests
5. **Authorization**: Each API request includes Authorization header
6. **Role Check**: Backend validates user role for protected endpoints

## 🐳 Docker Commands

```bash
# Build the backend image
docker build -t feedback-backend .

# Run the backend container
docker run -p 8000:8000 feedback-backend

# Run with volume for persistent database
docker run -p 8000:8000 -v $(pwd)/data:/app/data feedback-backend
```

## 🎯 Production Considerations

This application includes production-ready features:
- **Error handling** and user feedback
- **Loading states** for better UX
- **Input validation** and sanitization
- **Responsive design** for all devices
- **Clean code architecture** with TypeScript
- **Database persistence** with SQLite
- **Docker support** for easy deployment
- **Comprehensive logging** for debugging

## 🤖 AI Assistance

This project was built with assistance from AI tools for:
- Code structure and architecture planning
- Component design and implementation
- API endpoint development
- Documentation and README creation|

Tools used are :
1.Chatgpt 
2.Bolt for the beautiful frontend .

## 📈 Future Enhancements

Potential bonus features that could be added:
- **Feedback tags** (e.g., "leadership", "teamwork")
- **PDF export** functionality
- **Anonymous peer feedback** option
- **In-app notifications** for new feedback
- **Employee feedback requests**
- **Markdown support** in comments
- **Email notifications**
- **Advanced analytics** and reporting

## 🔧 Development

To contribute or extend the application:

1. **Code quality**: Follow TypeScript best practices
2. **Component structure**: Keep components focused and reusable  
3. **State management**: Use React Context for global state
4. **Styling**: Utilize Tailwind CSS utility classes
5. **API design**: Follow RESTful conventions
6. **Testing**: Add unit tests for critical functionality

## 📞 Support

For questions or issues:
1. Check the browser console for frontend errors
2. Review FastAPI logs for backend issues  
3. Verify all dependencies are installed correctly
4. Ensure both frontend and backend servers are running

--
