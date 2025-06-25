from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import hashlib
import secrets
from datetime import datetime
import json

app = FastAPI(title="Lightweight Feedback System", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBasic()

# Database setup
def init_db():
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            full_name TEXT NOT NULL,
            manager_id INTEGER,
            FOREIGN KEY (manager_id) REFERENCES users (id)
        )
    ''')
    
    # Feedback table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            manager_id INTEGER NOT NULL,
            employee_id INTEGER NOT NULL,
            strengths TEXT NOT NULL,
            improvements TEXT NOT NULL,
            sentiment TEXT NOT NULL,
            acknowledged BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (manager_id) REFERENCES users (id),
            FOREIGN KEY (employee_id) REFERENCES users (id)
        )
    ''')
    
    # Insert sample users
    sample_users = [
        (1, 'manager1', 'password123', 'manager', 'Alice Johnson', None),
        (2, 'manager2', 'password123', 'manager', 'Bob Smith', None),
        (3, 'employee1', 'password123', 'employee', 'Charlie Brown', 1),
        (4, 'employee2', 'password123', 'employee', 'Diana Wilson', 1),
        (5, 'employee3', 'password123', 'employee', 'Eve Davis', 2),
        (6, 'employee4', 'password123', 'employee', 'Frank Miller', 2),
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO users (id, username, password, role, full_name, manager_id) 
        VALUES (?, ?, ?, ?, ?, ?)
    ''', sample_users)
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Pydantic models
class User(BaseModel):
    id: int
    username: str
    role: str
    full_name: str
    manager_id: Optional[int] = None

class FeedbackCreate(BaseModel):
    employee_id: int
    strengths: str
    improvements: str
    sentiment: str

class FeedbackUpdate(BaseModel):
    strengths: str
    improvements: str
    sentiment: str

class Feedback(BaseModel):
    id: int
    manager_id: int
    employee_id: int
    employee_name: str
    strengths: str
    improvements: str
    sentiment: str
    acknowledged: bool
    created_at: str
    updated_at: str

class LoginResponse(BaseModel):
    user: User
    message: str

# Authentication helper
def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT id, username, role, full_name, manager_id FROM users WHERE username = ? AND password = ?",
        (credentials.username, credentials.password)
    )
    user_data = cursor.fetchone()
    conn.close()
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    return User(
        id=user_data[0],
        username=user_data[1],
        role=user_data[2],
        full_name=user_data[3],
        manager_id=user_data[4]
    )

# API Endpoints
@app.get("/")
def read_root():
    return {"message": "Lightweight Feedback System API"}

@app.post("/login", response_model=LoginResponse)
def login(current_user: User = Depends(get_current_user)):
    return LoginResponse(user=current_user, message="Login successful")

@app.get("/team", response_model=List[User])
def get_team_members(current_user: User = Depends(get_current_user)):
    if current_user.role != 'manager':
        raise HTTPException(status_code=403, detail="Only managers can view team members")
    
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT id, username, role, full_name, manager_id FROM users WHERE manager_id = ?",
        (current_user.id,)
    )
    team_data = cursor.fetchall()
    conn.close()
    
    return [User(
        id=member[0],
        username=member[1],
        role=member[2],
        full_name=member[3],
        manager_id=member[4]
    ) for member in team_data]

@app.post("/feedback", response_model=dict)
def create_feedback(feedback: FeedbackCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != 'manager':
        raise HTTPException(status_code=403, detail="Only managers can submit feedback")
    
    # Verify employee belongs to this manager
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT id FROM users WHERE id = ? AND manager_id = ?",
        (feedback.employee_id, current_user.id)
    )
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Employee not found or not in your team")
    
    # Insert feedback
    cursor.execute('''
        INSERT INTO feedback (manager_id, employee_id, strengths, improvements, sentiment)
        VALUES (?, ?, ?, ?, ?)
    ''', (current_user.id, feedback.employee_id, feedback.strengths, feedback.improvements, feedback.sentiment))
    
    conn.commit()
    feedback_id = cursor.lastrowid
    conn.close()
    
    return {"id": feedback_id, "message": "Feedback created successfully"}

@app.get("/feedback", response_model=List[Feedback])
def get_feedback(current_user: User = Depends(get_current_user)):
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    
    if current_user.role == 'manager':
        # Manager can see all feedback they've given
        cursor.execute('''
            SELECT f.id, f.manager_id, f.employee_id, u.full_name, f.strengths, 
                   f.improvements, f.sentiment, f.acknowledged, f.created_at, f.updated_at
            FROM feedback f
            JOIN users u ON f.employee_id = u.id
            WHERE f.manager_id = ?
            ORDER BY f.created_at DESC
        ''', (current_user.id,))
    else:
        # Employee can see only their own feedback
        cursor.execute('''
            SELECT f.id, f.manager_id, f.employee_id, u.full_name, f.strengths, 
                   f.improvements, f.sentiment, f.acknowledged, f.created_at, f.updated_at
            FROM feedback f
            JOIN users u ON f.employee_id = u.id
            WHERE f.employee_id = ?
            ORDER BY f.created_at DESC
        ''', (current_user.id,))
    
    feedback_data = cursor.fetchall()
    conn.close()
    
    return [Feedback(
        id=fb[0],
        manager_id=fb[1],
        employee_id=fb[2],
        employee_name=fb[3],
        strengths=fb[4],
        improvements=fb[5],
        sentiment=fb[6],
        acknowledged=bool(fb[7]),
        created_at=fb[8],
        updated_at=fb[9]
    ) for fb in feedback_data]

@app.put("/feedback/{feedback_id}", response_model=dict)
def update_feedback(feedback_id: int, feedback: FeedbackUpdate, current_user: User = Depends(get_current_user)):
    if current_user.role != 'manager':
        raise HTTPException(status_code=403, detail="Only managers can update feedback")
    
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    
    # Verify feedback belongs to this manager
    cursor.execute("SELECT id FROM feedback WHERE id = ? AND manager_id = ?", (feedback_id, current_user.id))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Feedback not found or not authorized")
    
    # Update feedback
    cursor.execute('''
        UPDATE feedback 
        SET strengths = ?, improvements = ?, sentiment = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (feedback.strengths, feedback.improvements, feedback.sentiment, feedback_id))
    
    conn.commit()
    conn.close()
    
    return {"message": "Feedback updated successfully"}

@app.post("/feedback/{feedback_id}/acknowledge", response_model=dict)
def acknowledge_feedback(feedback_id: int, current_user: User = Depends(get_current_user)):
    if current_user.role != 'employee':
        raise HTTPException(status_code=403, detail="Only employees can acknowledge feedback")
    
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    
    # Verify feedback belongs to this employee
    cursor.execute("SELECT id FROM feedback WHERE id = ? AND employee_id = ?", (feedback_id, current_user.id))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Feedback not found or not authorized")
    
    # Acknowledge feedback
    cursor.execute("UPDATE feedback SET acknowledged = TRUE WHERE id = ?", (feedback_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Feedback acknowledged successfully"}

@app.get("/analytics", response_model=dict)
def get_analytics(current_user: User = Depends(get_current_user)):
    if current_user.role != 'manager':
        raise HTTPException(status_code=403, detail="Only managers can view analytics")
    
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    
    # Get feedback count per team member
    cursor.execute('''
        SELECT u.full_name, COUNT(f.id) as feedback_count
        FROM users u
        LEFT JOIN feedback f ON u.id = f.employee_id AND f.manager_id = ?
        WHERE u.manager_id = ?
        GROUP BY u.id, u.full_name
    ''', (current_user.id, current_user.id))
    
    member_feedback_counts = dict(cursor.fetchall())
    
    # Get sentiment distribution
    cursor.execute('''
        SELECT sentiment, COUNT(*) as count
        FROM feedback
        WHERE manager_id = ?
        GROUP BY sentiment
    ''', (current_user.id,))
    
    sentiment_data = cursor.fetchall()
    sentiment_distribution = {sentiment: count for sentiment, count in sentiment_data}
    
    conn.close()
    
    return {
        "member_feedback_counts": member_feedback_counts,
        "sentiment_distribution": sentiment_distribution
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)