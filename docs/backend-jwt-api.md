# API d'Authentification JWT - Backend

## 📋 Vue d'ensemble

Cette documentation détaille l'implémentation de l'API d'authentification JWT pour le backend WakeDock (FastAPI).

## 🔗 Endpoints d'Authentification

### POST /api/v1/auth/login
Authentification utilisateur avec génération de tokens JWT.

**Request:**
```json
{
  "username": "user@example.com",
  "password": "securepassword",
  "rememberMe": false,
  "deviceId": "device-uuid-123",
  "mfaCode": "123456"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "user-uuid",
    "username": "user@example.com",
    "email": "user@example.com",
    "roles": ["user"],
    "permissions": ["read:containers", "write:containers"]
  },
  "session": {
    "id": "session-uuid",
    "expires_at": "2024-01-01T12:00:00Z",
    "device_id": "device-uuid-123"
  }
}
```

**Response (401):**
```json
{
  "error": "invalid_credentials",
  "message": "Invalid username or password",
  "details": {
    "attempts_remaining": 2,
    "lockout_duration": 300
  }
}
```

### POST /api/v1/auth/refresh
Renouvellement du token d'accès avec le refresh token.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### POST /api/v1/auth/logout
Déconnexion et révocation des tokens.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "message": "Successfully logged out"
}
```

### GET /api/v1/auth/me
Récupération des informations utilisateur authentifié.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "id": "user-uuid",
  "username": "user@example.com",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "roles": ["user"],
  "permissions": ["read:containers", "write:containers"],
  "last_login": "2024-01-01T10:00:00Z",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### POST /api/v1/auth/validate
Validation d'un token JWT.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "valid": true,
  "user_id": "user-uuid",
  "expires_at": "2024-01-01T12:00:00Z",
  "permissions": ["read:containers", "write:containers"]
}
```

## 🔧 Implémentation FastAPI

### 1. Modèles Pydantic

```python
# wakedock/api/auth/models.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from uuid import UUID

class LoginRequest(BaseModel):
    username: EmailStr
    password: str
    remember_me: bool = False
    device_id: Optional[str] = None
    mfa_code: Optional[str] = None

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int
    user: UserResponse
    session: SessionResponse

class RefreshRequest(BaseModel):
    refresh_token: str

class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in: int

class UserResponse(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    roles: List[str]
    permissions: List[str]
    last_login: Optional[datetime]
    created_at: datetime

class SessionResponse(BaseModel):
    id: UUID
    expires_at: datetime
    device_id: Optional[str]

class TokenValidation(BaseModel):
    token: str

class TokenValidationResponse(BaseModel):
    valid: bool
    user_id: Optional[UUID]
    expires_at: Optional[datetime]
    permissions: List[str]
```

### 2. Service d'Authentification

```python
# wakedock/api/auth/service.py
from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
from uuid import uuid4
from wakedock.database.models import User, Session
from wakedock.core.config import settings

class AuthService:
    def __init__(self):
        self.secret_key = settings.jwt_secret
        self.algorithm = "HS256"
        self.access_token_expire = timedelta(minutes=settings.access_token_expire_minutes)
        self.refresh_token_expire = timedelta(days=settings.refresh_token_expire_days)

    async def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """Authentification utilisateur"""
        user = await User.get_by_username(username)
        if not user or not self.verify_password(password, user.password_hash):
            return None
        
        if user.is_locked:
            raise AuthException("Account is locked")
        
        return user

    async def create_access_token(self, user: User) -> str:
        """Création du token d'accès"""
        payload = {
            "sub": str(user.id),
            "username": user.username,
            "email": user.email,
            "roles": [role.name for role in user.roles],
            "permissions": [perm.name for perm in user.permissions],
            "exp": datetime.utcnow() + self.access_token_expire,
            "iat": datetime.utcnow(),
            "type": "access"
        }
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    async def create_refresh_token(self, user: User, device_id: Optional[str] = None) -> str:
        """Création du refresh token"""
        session_id = str(uuid4())
        
        payload = {
            "sub": str(user.id),
            "session_id": session_id,
            "device_id": device_id,
            "exp": datetime.utcnow() + self.refresh_token_expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        }
        
        # Sauvegarder la session
        session = Session(
            id=session_id,
            user_id=user.id,
            device_id=device_id,
            expires_at=datetime.utcnow() + self.refresh_token_expire,
            created_at=datetime.utcnow()
        )
        await session.save()
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    async def validate_token(self, token: str) -> Optional[dict]:
        """Validation d'un token JWT"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise AuthException("Token has expired")
        except jwt.InvalidTokenError:
            raise AuthException("Invalid token")

    async def refresh_access_token(self, refresh_token: str) -> str:
        """Renouvellement du token d'accès"""
        payload = await self.validate_token(refresh_token)
        
        if payload.get("type") != "refresh":
            raise AuthException("Invalid refresh token")
        
        # Vérifier que la session existe
        session = await Session.get_by_id(payload["session_id"])
        if not session or session.expires_at < datetime.utcnow():
            raise AuthException("Session expired")
        
        # Récupérer l'utilisateur
        user = await User.get_by_id(payload["sub"])
        if not user:
            raise AuthException("User not found")
        
        return await self.create_access_token(user)

    async def revoke_token(self, refresh_token: str) -> None:
        """Révocation d'un token"""
        payload = await self.validate_token(refresh_token)
        
        # Supprimer la session
        session = await Session.get_by_id(payload["session_id"])
        if session:
            await session.delete()

    def verify_password(self, password: str, hashed: str) -> bool:
        """Vérification du mot de passe"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

    def hash_password(self, password: str) -> str:
        """Hachage du mot de passe"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

class AuthException(Exception):
    pass
```

### 3. Routes d'Authentification

```python
# wakedock/api/auth/routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from wakedock.api.auth.models import *
from wakedock.api.auth.service import AuthService, AuthException
from wakedock.api.auth.dependencies import get_current_user
from wakedock.database.models import User

router = APIRouter(prefix="/auth", tags=["authentication"])
auth_service = AuthService()
security = HTTPBearer()

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Authentification utilisateur"""
    try:
        user = await auth_service.authenticate_user(request.username, request.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Créer les tokens
        access_token = await auth_service.create_access_token(user)
        refresh_token = await auth_service.create_refresh_token(user, request.device_id)
        
        # Mettre à jour la dernière connexion
        user.last_login = datetime.utcnow()
        await user.save()
        
        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.access_token_expire_minutes * 60,
            user=UserResponse.from_orm(user),
            session=SessionResponse(
                id=uuid4(),
                expires_at=datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days),
                device_id=request.device_id
            )
        )
    
    except AuthException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

@router.post("/refresh", response_model=RefreshResponse)
async def refresh_token(request: RefreshRequest):
    """Renouvellement du token d'accès"""
    try:
        access_token = await auth_service.refresh_access_token(request.refresh_token)
        
        return RefreshResponse(
            access_token=access_token,
            expires_in=settings.access_token_expire_minutes * 60
        )
    
    except AuthException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

@router.post("/logout")
async def logout(request: RefreshRequest):
    """Déconnexion utilisateur"""
    try:
        await auth_service.revoke_token(request.refresh_token)
        return {"message": "Successfully logged out"}
    
    except AuthException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Informations utilisateur authentifié"""
    return UserResponse.from_orm(current_user)

@router.post("/validate", response_model=TokenValidationResponse)
async def validate_token(request: TokenValidation):
    """Validation d'un token JWT"""
    try:
        payload = await auth_service.validate_token(request.token)
        
        return TokenValidationResponse(
            valid=True,
            user_id=payload["sub"],
            expires_at=datetime.fromtimestamp(payload["exp"]),
            permissions=payload.get("permissions", [])
        )
    
    except AuthException:
        return TokenValidationResponse(
            valid=False,
            user_id=None,
            expires_at=None,
            permissions=[]
        )
```

### 4. Dépendances d'Authentification

```python
# wakedock/api/auth/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from wakedock.api.auth.service import AuthService, AuthException
from wakedock.database.models import User
from typing import Optional

security = HTTPBearer()
auth_service = AuthService()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Récupération de l'utilisateur courant"""
    try:
        payload = await auth_service.validate_token(credentials.credentials)
        user = await User.get_by_id(payload["sub"])
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return user
    
    except AuthException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[User]:
    """Récupération optionnelle de l'utilisateur"""
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None

def require_permissions(*permissions: str):
    """Décorateur pour vérifier les permissions"""
    def decorator(func):
        async def wrapper(current_user: User = Depends(get_current_user), *args, **kwargs):
            user_permissions = [perm.name for perm in current_user.permissions]
            
            if not all(perm in user_permissions for perm in permissions):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
            
            return await func(current_user, *args, **kwargs)
        return wrapper
    return decorator
```

### 5. Configuration

```python
# wakedock/core/config.py
from pydantic import BaseSettings

class Settings(BaseSettings):
    # JWT Configuration
    jwt_secret: str = "your-secret-key"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # Security
    max_login_attempts: int = 5
    lockout_duration_minutes: int = 30
    
    # Database
    database_url: str = "postgresql://user:pass@localhost/wakedock"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## 🔒 Sécurité

### Rate Limiting
```python
# wakedock/api/auth/middleware.py
from fastapi import Request, HTTPException, status
from typing import Dict
import time

class RateLimiter:
    def __init__(self, max_attempts: int = 5, window_seconds: int = 300):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self.attempts: Dict[str, list] = {}
    
    def check_rate_limit(self, identifier: str) -> bool:
        now = time.time()
        
        if identifier not in self.attempts:
            self.attempts[identifier] = []
        
        # Nettoyer les anciennes tentatives
        self.attempts[identifier] = [
            attempt for attempt in self.attempts[identifier]
            if now - attempt < self.window_seconds
        ]
        
        if len(self.attempts[identifier]) >= self.max_attempts:
            return False
        
        self.attempts[identifier].append(now)
        return True

rate_limiter = RateLimiter()

async def check_login_rate_limit(request: Request):
    client_ip = request.client.host
    if not rate_limiter.check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later."
        )
```

### Audit Logging
```python
# wakedock/api/auth/audit.py
from datetime import datetime
from wakedock.database.models import AuditLog
from typing import Optional

class AuditLogger:
    @staticmethod
    async def log_login_attempt(
        username: str,
        ip_address: str,
        user_agent: str,
        success: bool,
        error_message: Optional[str] = None
    ):
        log = AuditLog(
            event_type="login_attempt",
            user_id=None,
            username=username,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            error_message=error_message,
            timestamp=datetime.utcnow()
        )
        await log.save()
```

## 📊 Métriques et Monitoring

### Health Check
```python
@router.get("/health")
async def auth_health():
    """Vérification de l'état du service d'authentification"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }
```

### Métriques
```python
@router.get("/metrics")
async def auth_metrics():
    """Métriques d'authentification"""
    return {
        "active_sessions": await Session.count_active(),
        "failed_attempts_last_hour": await AuditLog.count_failed_attempts_last_hour(),
        "total_users": await User.count(),
        "locked_accounts": await User.count_locked()
    }
```

---

*Cette API JWT fournit une authentification sécurisée et complète pour WakeDock.*