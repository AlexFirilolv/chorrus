from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
import os
from .config import settings
from ..core.database import get_db
from ..models.user import User

# Initialize Firebase Admin SDK
def initialize_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": settings.FIREBASE_PROJECT_ID,
            "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
            "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n"),
            "client_email": settings.FIREBASE_CLIENT_EMAIL,
            "client_id": settings.FIREBASE_CLIENT_ID,
            "auth_uri": f"https://accounts.google.com/o/oauth2/auth",
            "token_uri": f"https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{settings.FIREBASE_CLIENT_EMAIL}"
        })
        firebase_admin.initialize_app(cred)

initialize_firebase()

security = HTTPBearer()

async def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Firebase JWT token and return decoded token"""
    try:
        token = credentials.credentials
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    decoded_token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from database or create if doesn't exist"""
    firebase_uid = decoded_token.get("uid")
    email = decoded_token.get("email")
    
    if not firebase_uid or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    
    if not user:
        # Create new user
        user = User(
            firebase_uid=firebase_uid,
            email=email,
            display_name=decoded_token.get("name")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure user is active and has required permissions"""
    return current_user