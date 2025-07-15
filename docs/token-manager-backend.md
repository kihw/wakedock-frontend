# Guide TokenManager Backend

## 📋 Vue d'ensemble

Ce guide détaille l'implémentation complète du TokenManager côté backend (FastAPI) pour WakeDock, couvrant la génération, validation, refresh et révocation des tokens JWT.

## 🏗️ Architecture TokenManager

```
┌─────────────────────────────────────────────────────────────────┐
│                    TokenManager Backend                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐│
│  │   JWTManager    │    │   TokenStore    │    │   TokenValidator││
│  │   (Core Logic)  │◄──►│   (Storage)     │◄──►│   (Validation)  ││
│  └─────────────────┘    └─────────────────┘    └─────────────────┘│
│           │                       │                       │      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐│
│  │   TokenCrypto   │    │   TokenBlacklist│    │   TokenMetrics  ││
│  │   (Cryptography)│    │   (Revocation)  │    │   (Analytics)   ││
│  └─────────────────┘    └─────────────────┘    └─────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                  │
                              Database
                                  │
┌─────────────────────────────────────────────────────────────────┐
│                    Token Storage                                │
├─────────────────────────────────────────────────────────────────┤
│  • Active Sessions (Redis)                                     │
│  • Blacklisted Tokens (Redis)                                  │
│  • Token Metrics (PostgreSQL)                                  │
│  • Refresh Tokens (PostgreSQL)                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Implémentation Core

### 1. TokenManager Principal

```python
# wakedock/core/token_manager.py
import jwt
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from redis import Redis
from sqlalchemy.orm import Session

from wakedock.database.models import User, RefreshToken, TokenBlacklist
from wakedock.core.config import settings
from wakedock.core.exceptions import TokenError, TokenExpiredError, TokenInvalidError


@dataclass
class TokenPayload:
    user_id: str
    username: str
    email: str
    roles: List[str]
    permissions: List[str]
    session_id: str
    device_id: Optional[str] = None
    scope: List[str] = None
    token_type: str = 'access'


@dataclass
class TokenPair:
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str = 'Bearer'


class TokenManager:
    """Gestionnaire centralisé des tokens JWT"""
    
    def __init__(self, redis_client: Redis, db_session: Session):
        self.redis = redis_client
        self.db = db_session
        self.secret_key = settings.jwt_secret_key
        self.algorithm = settings.jwt_algorithm
        self.access_token_expire = timedelta(minutes=settings.access_token_expire_minutes)
        self.refresh_token_expire = timedelta(days=settings.refresh_token_expire_days)
        
        # Préfixes Redis
        self.session_prefix = "session:"
        self.blacklist_prefix = "blacklist:"
        self.metrics_prefix = "token_metrics:"
    
    async def create_token_pair(
        self, 
        user: User, 
        device_id: Optional[str] = None,
        scope: Optional[List[str]] = None
    ) -> TokenPair:
        """Création d'une paire de tokens (access + refresh)"""
        
        # Générer un ID de session unique
        session_id = self._generate_session_id()
        
        # Créer le payload pour l'access token
        access_payload = TokenPayload(
            user_id=str(user.id),
            username=user.username,
            email=user.email,
            roles=[role.name for role in user.roles],
            permissions=[perm.name for perm in user.permissions],
            session_id=session_id,
            device_id=device_id,
            scope=scope or [],
            token_type='access'
        )
        
        # Créer le payload pour le refresh token
        refresh_payload = TokenPayload(
            user_id=str(user.id),
            username=user.username,
            email=user.email,
            roles=[],
            permissions=[],
            session_id=session_id,
            device_id=device_id,
            scope=scope or [],
            token_type='refresh'
        )
        
        # Générer les tokens
        access_token = self._create_jwt_token(access_payload, self.access_token_expire)
        refresh_token = self._create_jwt_token(refresh_payload, self.refresh_token_expire)
        
        # Stocker la session dans Redis
        await self._store_session(session_id, user.id, device_id, self.refresh_token_expire)
        
        # Stocker le refresh token en base
        await self._store_refresh_token(refresh_token, user.id, session_id, device_id)
        
        # Métriques
        await self._record_token_creation(user.id, device_id)
        
        return TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=int(self.access_token_expire.total_seconds()),
            token_type='Bearer'
        )
    
    def _create_jwt_token(self, payload: TokenPayload, expire_delta: timedelta) -> str:
        """Création d'un token JWT"""
        now = datetime.utcnow()
        expire = now + expire_delta
        
        jwt_payload = {
            'sub': payload.user_id,
            'username': payload.username,
            'email': payload.email,
            'roles': payload.roles,
            'permissions': payload.permissions,
            'session_id': payload.session_id,
            'device_id': payload.device_id,
            'scope': payload.scope,
            'token_type': payload.token_type,
            'iat': now,
            'exp': expire,
            'iss': settings.jwt_issuer,
            'aud': settings.jwt_audience,
            'jti': secrets.token_urlsafe(32)  # JWT ID unique
        }
        
        # Supprimer les valeurs None
        jwt_payload = {k: v for k, v in jwt_payload.items() if v is not None}
        
        return jwt.encode(jwt_payload, self.secret_key, algorithm=self.algorithm)
    
    async def validate_token(self, token: str) -> Dict[str, Any]:
        """Validation d'un token JWT"""
        try:
            # Vérifier si le token est en liste noire
            if await self._is_token_blacklisted(token):
                raise TokenInvalidError("Token has been revoked")
            
            # Décoder le token
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm],
                audience=settings.jwt_audience,
                issuer=settings.jwt_issuer
            )
            
            # Vérifier la session si c'est un refresh token
            if payload.get('token_type') == 'refresh':
                session_valid = await self._is_session_valid(payload['session_id'])
                if not session_valid:
                    raise TokenInvalidError("Session has expired")
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise TokenExpiredError("Token has expired")
        except jwt.InvalidTokenError as e:
            raise TokenInvalidError(f"Invalid token: {str(e)}")
    
    async def refresh_access_token(self, refresh_token: str) -> str:
        """Renouvellement d'un access token"""
        # Valider le refresh token
        payload = await self.validate_token(refresh_token)
        
        if payload.get('token_type') != 'refresh':
            raise TokenInvalidError("Invalid token type for refresh")
        
        # Récupérer l'utilisateur
        user = await self._get_user_by_id(payload['sub'])
        if not user:
            raise TokenInvalidError("User not found")
        
        # Vérifier que le refresh token existe en base
        refresh_token_record = await self._get_refresh_token_record(refresh_token)
        if not refresh_token_record or refresh_token_record.revoked:
            raise TokenInvalidError("Refresh token has been revoked")
        
        # Créer un nouveau access token
        access_payload = TokenPayload(
            user_id=str(user.id),
            username=user.username,
            email=user.email,
            roles=[role.name for role in user.roles],
            permissions=[perm.name for perm in user.permissions],
            session_id=payload['session_id'],
            device_id=payload.get('device_id'),
            scope=payload.get('scope', []),
            token_type='access'
        )
        
        new_access_token = self._create_jwt_token(access_payload, self.access_token_expire)
        
        # Mettre à jour les métriques
        await self._record_token_refresh(user.id, payload.get('device_id'))
        
        return new_access_token
    
    async def revoke_token(self, token: str) -> bool:
        """Révocation d'un token"""
        try:
            payload = await self.validate_token(token)
            
            # Ajouter à la liste noire
            await self._blacklist_token(token, payload)
            
            # Si c'est un refresh token, le marquer comme révoqué
            if payload.get('token_type') == 'refresh':
                await self._revoke_refresh_token(token)
                # Supprimer la session
                await self._invalidate_session(payload['session_id'])
            
            # Métriques
            await self._record_token_revocation(payload['sub'], payload.get('device_id'))
            
            return True
            
        except (TokenError, TokenExpiredError, TokenInvalidError):
            return False
    
    async def revoke_all_user_tokens(self, user_id: str) -> int:
        """Révocation de tous les tokens d'un utilisateur"""
        count = 0
        
        # Révoquer tous les refresh tokens
        refresh_tokens = await self._get_user_refresh_tokens(user_id)
        for refresh_token in refresh_tokens:
            if not refresh_token.revoked:
                await self._revoke_refresh_token_record(refresh_token)
                await self._invalidate_session(refresh_token.session_id)
                count += 1
        
        # Métriques
        await self._record_bulk_token_revocation(user_id, count)
        
        return count
    
    async def get_active_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """Récupération des sessions actives d'un utilisateur"""
        sessions = []
        
        # Récupérer les sessions depuis Redis
        pattern = f"{self.session_prefix}*"
        session_keys = await self.redis.keys(pattern)
        
        for key in session_keys:
            session_data = await self.redis.hgetall(key)
            if session_data.get('user_id') == user_id:
                sessions.append({
                    'session_id': key.replace(self.session_prefix, ''),
                    'user_id': session_data['user_id'],
                    'device_id': session_data.get('device_id'),
                    'created_at': session_data.get('created_at'),
                    'last_activity': session_data.get('last_activity'),
                    'expires_at': session_data.get('expires_at')
                })
        
        return sessions
    
    # Méthodes privées
    
    def _generate_session_id(self) -> str:
        """Génération d'un ID de session unique"""
        return f"sess_{secrets.token_urlsafe(32)}"
    
    async def _store_session(
        self, 
        session_id: str, 
        user_id: str, 
        device_id: Optional[str], 
        expire_delta: timedelta
    ) -> None:
        """Stockage d'une session dans Redis"""
        session_data = {
            'user_id': str(user_id),
            'device_id': device_id or '',
            'created_at': datetime.utcnow().isoformat(),
            'last_activity': datetime.utcnow().isoformat(),
            'expires_at': (datetime.utcnow() + expire_delta).isoformat()
        }
        
        key = f"{self.session_prefix}{session_id}"
        await self.redis.hset(key, mapping=session_data)
        await self.redis.expire(key, int(expire_delta.total_seconds()))
    
    async def _store_refresh_token(
        self, 
        token: str, 
        user_id: str, 
        session_id: str, 
        device_id: Optional[str]
    ) -> None:
        """Stockage d'un refresh token en base"""
        token_hash = self._hash_token(token)
        
        refresh_token = RefreshToken(
            token_hash=token_hash,
            user_id=user_id,
            session_id=session_id,
            device_id=device_id,
            created_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + self.refresh_token_expire,
            revoked=False
        )
        
        self.db.add(refresh_token)
        await self.db.commit()
    
    async def _is_token_blacklisted(self, token: str) -> bool:
        """Vérification si un token est en liste noire"""
        token_hash = self._hash_token(token)
        key = f"{self.blacklist_prefix}{token_hash}"
        return await self.redis.exists(key)
    
    async def _blacklist_token(self, token: str, payload: Dict[str, Any]) -> None:
        """Ajout d'un token à la liste noire"""
        token_hash = self._hash_token(token)
        key = f"{self.blacklist_prefix}{token_hash}"
        
        blacklist_data = {
            'user_id': payload['sub'],
            'session_id': payload.get('session_id', ''),
            'device_id': payload.get('device_id', ''),
            'revoked_at': datetime.utcnow().isoformat(),
            'token_type': payload.get('token_type', 'access')
        }
        
        await self.redis.hset(key, mapping=blacklist_data)
        
        # Définir l'expiration basée sur l'expiration du token
        if 'exp' in payload:
            exp_time = datetime.fromtimestamp(payload['exp'])
            ttl = int((exp_time - datetime.utcnow()).total_seconds())
            if ttl > 0:
                await self.redis.expire(key, ttl)
    
    async def _is_session_valid(self, session_id: str) -> bool:
        """Vérification de la validité d'une session"""
        key = f"{self.session_prefix}{session_id}"
        return await self.redis.exists(key)
    
    async def _invalidate_session(self, session_id: str) -> None:
        """Invalidation d'une session"""
        key = f"{self.session_prefix}{session_id}"
        await self.redis.delete(key)
    
    def _hash_token(self, token: str) -> str:
        """Hachage d'un token pour le stockage"""
        return hashlib.sha256(token.encode()).hexdigest()
    
    async def _get_user_by_id(self, user_id: str) -> Optional[User]:
        """Récupération d'un utilisateur par ID"""
        return await self.db.query(User).filter(User.id == user_id).first()
    
    async def _get_refresh_token_record(self, token: str) -> Optional[RefreshToken]:
        """Récupération d'un refresh token depuis la base"""
        token_hash = self._hash_token(token)
        return await self.db.query(RefreshToken).filter(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked == False
        ).first()
    
    async def _revoke_refresh_token(self, token: str) -> None:
        """Révocation d'un refresh token"""
        token_record = await self._get_refresh_token_record(token)
        if token_record:
            token_record.revoked = True
            token_record.revoked_at = datetime.utcnow()
            await self.db.commit()
    
    async def _revoke_refresh_token_record(self, token_record: RefreshToken) -> None:
        """Révocation d'un refresh token par record"""
        token_record.revoked = True
        token_record.revoked_at = datetime.utcnow()
        await self.db.commit()
    
    async def _get_user_refresh_tokens(self, user_id: str) -> List[RefreshToken]:
        """Récupération de tous les refresh tokens d'un utilisateur"""
        return await self.db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked == False
        ).all()
    
    # Méthodes de métriques
    
    async def _record_token_creation(self, user_id: str, device_id: Optional[str]) -> None:
        """Enregistrement de création de token"""
        await self._increment_metric('tokens_created')
        await self._increment_metric(f'tokens_created:user:{user_id}')
        if device_id:
            await self._increment_metric(f'tokens_created:device:{device_id}')
    
    async def _record_token_refresh(self, user_id: str, device_id: Optional[str]) -> None:
        """Enregistrement de refresh de token"""
        await self._increment_metric('tokens_refreshed')
        await self._increment_metric(f'tokens_refreshed:user:{user_id}')
        if device_id:
            await self._increment_metric(f'tokens_refreshed:device:{device_id}')
    
    async def _record_token_revocation(self, user_id: str, device_id: Optional[str]) -> None:
        """Enregistrement de révocation de token"""
        await self._increment_metric('tokens_revoked')
        await self._increment_metric(f'tokens_revoked:user:{user_id}')
        if device_id:
            await self._increment_metric(f'tokens_revoked:device:{device_id}')
    
    async def _record_bulk_token_revocation(self, user_id: str, count: int) -> None:
        """Enregistrement de révocation en masse"""
        await self._increment_metric('tokens_bulk_revoked', count)
        await self._increment_metric(f'tokens_bulk_revoked:user:{user_id}', count)
    
    async def _increment_metric(self, metric_name: str, value: int = 1) -> None:
        """Incrémentation d'une métrique"""
        key = f"{self.metrics_prefix}{metric_name}"
        await self.redis.incrby(key, value)
        
        # Expiration quotidienne pour les métriques
        await self.redis.expire(key, 86400)  # 24 heures
```

### 2. Modèles de Base de Données

```python
# wakedock/database/models.py
from sqlalchemy import Column, String, DateTime, Boolean, Integer, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class RefreshToken(Base):
    __tablename__ = 'refresh_tokens'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    token_hash = Column(String, unique=True, nullable=False, index=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    session_id = Column(String, nullable=False, index=True)
    device_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False)
    revoked_at = Column(DateTime, nullable=True)
    last_used = Column(DateTime, nullable=True)
    
    # Relations
    user = relationship("User", back_populates="refresh_tokens")

class TokenBlacklist(Base):
    __tablename__ = 'token_blacklist'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    token_hash = Column(String, unique=True, nullable=False, index=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    session_id = Column(String, nullable=True)
    device_id = Column(String, nullable=True)
    token_type = Column(String, nullable=False)  # 'access' ou 'refresh'
    revoked_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    reason = Column(String, nullable=True)
    
    # Relations
    user = relationship("User")

class TokenMetrics(Base):
    __tablename__ = 'token_metrics'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id'), nullable=True)
    device_id = Column(String, nullable=True)
    metric_type = Column(String, nullable=False)  # 'created', 'refreshed', 'revoked'
    count = Column(Integer, default=1)
    timestamp = Column(DateTime, default=datetime.utcnow)
    additional_data = Column(Text, nullable=True)  # JSON pour données supplémentaires
    
    # Relations
    user = relationship("User")
```

### 3. Service d'Authentification avec TokenManager

```python
# wakedock/services/auth_service.py
from typing import Optional
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from passlib.context import CryptContext

from wakedock.core.token_manager import TokenManager, TokenPair
from wakedock.database.models import User
from wakedock.core.exceptions import AuthenticationError

class AuthService:
    def __init__(self, token_manager: TokenManager):
        self.token_manager = token_manager
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    async def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """Authentification d'un utilisateur"""
        user = await self._get_user_by_username(username)
        
        if not user:
            return None
        
        if not self._verify_password(password, user.password_hash):
            return None
        
        if not user.is_active:
            raise AuthenticationError("Account is disabled")
        
        if user.is_locked:
            raise AuthenticationError("Account is locked")
        
        return user
    
    async def login(
        self, 
        username: str, 
        password: str, 
        device_id: Optional[str] = None
    ) -> TokenPair:
        """Connexion utilisateur"""
        user = await self.authenticate_user(username, password)
        
        if not user:
            raise AuthenticationError("Invalid credentials")
        
        # Créer les tokens
        token_pair = await self.token_manager.create_token_pair(user, device_id)
        
        # Mettre à jour la dernière connexion
        user.last_login = datetime.utcnow()
        await self._save_user(user)
        
        return token_pair
    
    async def refresh_token(self, refresh_token: str) -> str:
        """Renouvellement d'un token"""
        return await self.token_manager.refresh_access_token(refresh_token)
    
    async def logout(self, refresh_token: str) -> bool:
        """Déconnexion utilisateur"""
        return await self.token_manager.revoke_token(refresh_token)
    
    async def logout_all_devices(self, user_id: str) -> int:
        """Déconnexion de tous les appareils"""
        return await self.token_manager.revoke_all_user_tokens(user_id)
    
    def _verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Vérification du mot de passe"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    async def _get_user_by_username(self, username: str) -> Optional[User]:
        """Récupération d'un utilisateur par nom d'utilisateur"""
        # Implémentation avec votre ORM
        pass
    
    async def _save_user(self, user: User) -> None:
        """Sauvegarde d'un utilisateur"""
        # Implémentation avec votre ORM
        pass
```

### 4. Middleware d'Authentification

```python
# wakedock/middleware/auth_middleware.py
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from wakedock.core.token_manager import TokenManager
from wakedock.core.exceptions import TokenError, TokenExpiredError, TokenInvalidError

class AuthMiddleware:
    def __init__(self, token_manager: TokenManager):
        self.token_manager = token_manager
        self.bearer = HTTPBearer(auto_error=False)
    
    async def __call__(self, request: Request, call_next):
        """Middleware d'authentification"""
        
        # Vérifier si l'endpoint nécessite une authentification
        if not self._requires_auth(request.url.path):
            return await call_next(request)
        
        # Extraire le token
        authorization = request.headers.get("Authorization")
        if not authorization:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authorization header"
            )
        
        try:
            token = authorization.replace("Bearer ", "")
            payload = await self.token_manager.validate_token(token)
            
            # Ajouter les infos utilisateur à la requête
            request.state.user_id = payload['sub']
            request.state.session_id = payload.get('session_id')
            request.state.permissions = payload.get('permissions', [])
            request.state.roles = payload.get('roles', [])
            
        except TokenExpiredError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except TokenInvalidError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication error"
            )
        
        return await call_next(request)
    
    def _requires_auth(self, path: str) -> bool:
        """Vérifier si un endpoint nécessite une authentification"""
        public_paths = [
            "/docs",
            "/openapi.json",
            "/api/v1/auth/login",
            "/api/v1/auth/refresh",
            "/api/v1/health"
        ]
        
        return not any(path.startswith(p) for p in public_paths)
```

### 5. Endpoints d'Administration

```python
# wakedock/api/admin/token_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any

from wakedock.core.token_manager import TokenManager
from wakedock.api.dependencies import get_current_admin_user, get_token_manager

router = APIRouter(prefix="/admin/tokens", tags=["admin", "tokens"])

@router.get("/sessions/{user_id}")
async def get_user_sessions(
    user_id: str,
    token_manager: TokenManager = Depends(get_token_manager),
    current_admin = Depends(get_current_admin_user)
) -> List[Dict[str, Any]]:
    """Récupération des sessions actives d'un utilisateur"""
    return await token_manager.get_active_sessions(user_id)

@router.delete("/sessions/{user_id}")
async def revoke_user_sessions(
    user_id: str,
    token_manager: TokenManager = Depends(get_token_manager),
    current_admin = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """Révocation de toutes les sessions d'un utilisateur"""
    count = await token_manager.revoke_all_user_tokens(user_id)
    return {"message": f"Revoked {count} sessions"}

@router.post("/revoke")
async def revoke_token(
    token: str,
    token_manager: TokenManager = Depends(get_token_manager),
    current_admin = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """Révocation d'un token spécifique"""
    success = await token_manager.revoke_token(token)
    return {"success": success}

@router.get("/metrics")
async def get_token_metrics(
    token_manager: TokenManager = Depends(get_token_manager),
    current_admin = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """Récupération des métriques des tokens"""
    # Implémentation des métriques
    return {
        "tokens_created_today": await token_manager._get_daily_metric('tokens_created'),
        "tokens_refreshed_today": await token_manager._get_daily_metric('tokens_refreshed'),
        "tokens_revoked_today": await token_manager._get_daily_metric('tokens_revoked'),
        "active_sessions": await token_manager._get_active_sessions_count()
    }
```

### 6. Configuration

```python
# wakedock/core/config.py
from pydantic import BaseSettings

class Settings(BaseSettings):
    # JWT Configuration
    jwt_secret_key: str = "your-super-secret-key"
    jwt_algorithm: str = "HS256"
    jwt_issuer: str = "wakedock"
    jwt_audience: str = "wakedock-users"
    
    # Token Expiration
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    redis_db: int = 0
    
    # Database Configuration
    database_url: str = "postgresql://user:pass@localhost/wakedock"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### 7. Tests

```python
# tests/test_token_manager.py
import pytest
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

from wakedock.core.token_manager import TokenManager, TokenPayload, TokenPair
from wakedock.core.exceptions import TokenExpiredError, TokenInvalidError

@pytest.fixture
def token_manager():
    redis_mock = AsyncMock()
    db_mock = AsyncMock()
    return TokenManager(redis_mock, db_mock)

@pytest.fixture
def sample_user():
    user = MagicMock()
    user.id = "user123"
    user.username = "testuser"
    user.email = "test@example.com"
    user.roles = []
    user.permissions = []
    return user

@pytest.mark.asyncio
async def test_create_token_pair(token_manager, sample_user):
    """Test de création d'une paire de tokens"""
    token_pair = await token_manager.create_token_pair(sample_user)
    
    assert isinstance(token_pair, TokenPair)
    assert token_pair.access_token
    assert token_pair.refresh_token
    assert token_pair.token_type == "Bearer"
    assert token_pair.expires_in > 0

@pytest.mark.asyncio
async def test_validate_token_success(token_manager, sample_user):
    """Test de validation d'un token valide"""
    token_pair = await token_manager.create_token_pair(sample_user)
    payload = await token_manager.validate_token(token_pair.access_token)
    
    assert payload['sub'] == str(sample_user.id)
    assert payload['username'] == sample_user.username
    assert payload['token_type'] == 'access'

@pytest.mark.asyncio
async def test_validate_expired_token(token_manager):
    """Test de validation d'un token expiré"""
    # Créer un token expiré
    expired_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxNjA5NDU5MjAwfQ.invalid"
    
    with pytest.raises(TokenExpiredError):
        await token_manager.validate_token(expired_token)

@pytest.mark.asyncio
async def test_refresh_access_token(token_manager, sample_user):
    """Test de renouvellement d'un access token"""
    token_pair = await token_manager.create_token_pair(sample_user)
    
    # Mock de la récupération du refresh token
    token_manager._get_refresh_token_record = AsyncMock(return_value=MagicMock(revoked=False))
    token_manager._get_user_by_id = AsyncMock(return_value=sample_user)
    
    new_access_token = await token_manager.refresh_access_token(token_pair.refresh_token)
    
    assert new_access_token
    assert new_access_token != token_pair.access_token

@pytest.mark.asyncio
async def test_revoke_token(token_manager, sample_user):
    """Test de révocation d'un token"""
    token_pair = await token_manager.create_token_pair(sample_user)
    
    success = await token_manager.revoke_token(token_pair.access_token)
    
    assert success
    
    # Vérifier que le token est en liste noire
    assert await token_manager._is_token_blacklisted(token_pair.access_token)

@pytest.mark.asyncio
async def test_revoke_all_user_tokens(token_manager, sample_user):
    """Test de révocation de tous les tokens d'un utilisateur"""
    # Mock des refresh tokens utilisateur
    mock_tokens = [MagicMock(revoked=False) for _ in range(3)]
    token_manager._get_user_refresh_tokens = AsyncMock(return_value=mock_tokens)
    
    count = await token_manager.revoke_all_user_tokens(str(sample_user.id))
    
    assert count == 3
```

---

*Ce guide TokenManager fournit une gestion complète et sécurisée des tokens JWT pour WakeDock.*