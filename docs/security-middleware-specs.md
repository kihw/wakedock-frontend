# Spécifications Middleware Sécurité

## 📋 Vue d'ensemble

Ce document détaille les spécifications des middleware de sécurité pour WakeDock, couvrant la protection CSRF, le rate limiting, la validation des requêtes et l'audit de sécurité.

## 🛡️ Architecture Middleware

```
┌─────────────────────────────────────────────────────────────────┐
│                    Requête Entrante                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│               Rate Limiting Middleware                          │
│  • Vérification limite requêtes/IP                             │
│  • Gestion des tentatives de connexion                         │
│  • Blocage automatique des IPs suspectes                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│               CSRF Protection Middleware                        │
│  • Validation des tokens CSRF                                  │
│  • Vérification des headers Origin/Referer                     │
│  • Protection contre les attaques CSRF                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│               Security Headers Middleware                       │
│  • Injection des headers de sécurité                           │
│  • Content Security Policy (CSP)                               │
│  • HSTS, X-Frame-Options, etc.                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│               Request Validation Middleware                     │
│  • Validation des données d'entrée                             │
│  • Sanitisation des paramètres                                 │
│  • Vérification des types de contenu                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│               Audit Logging Middleware                          │
│  • Enregistrement des événements de sécurité                   │
│  • Tracking des actions utilisateur                            │
│  • Détection d'activités suspectes                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    Application Logic                            │
└─────────────────────────────────────────────────────────────────┘
```

## 🔒 Rate Limiting Middleware

### Configuration
```python
# wakedock/security/rate_limit.py
from dataclasses import dataclass
from typing import Dict, Optional
import time
from redis import Redis
from fastapi import Request, HTTPException, status

@dataclass
class RateLimitConfig:
    max_requests: int = 100
    window_seconds: int = 300  # 5 minutes
    burst_limit: int = 10      # Limite instantanée
    whitelist_ips: list = None
    blacklist_ips: list = None

class RateLimiter:
    def __init__(self, config: RateLimitConfig, redis_client: Optional[Redis] = None):
        self.config = config
        self.redis = redis_client or Redis.from_url("redis://localhost:6379")
        self.local_cache: Dict[str, list] = {}
        
    async def check_rate_limit(self, identifier: str) -> bool:
        """Vérification de la limite de débit"""
        now = time.time()
        
        # Utiliser Redis si disponible, sinon cache local
        if self.redis:
            return await self._check_redis_limit(identifier, now)
        else:
            return self._check_local_limit(identifier, now)
    
    async def _check_redis_limit(self, identifier: str, now: float) -> bool:
        key = f"rate_limit:{identifier}"
        
        # Sliding window avec Redis
        pipe = self.redis.pipeline()
        pipe.zremrangebyscore(key, 0, now - self.config.window_seconds)
        pipe.zcard(key)
        pipe.zadd(key, {str(now): now})
        pipe.expire(key, self.config.window_seconds)
        
        results = pipe.execute()
        current_requests = results[1]
        
        return current_requests < self.config.max_requests
    
    def _check_local_limit(self, identifier: str, now: float) -> bool:
        if identifier not in self.local_cache:
            self.local_cache[identifier] = []
        
        # Nettoyer les anciennes entrées
        self.local_cache[identifier] = [
            req_time for req_time in self.local_cache[identifier]
            if now - req_time < self.config.window_seconds
        ]
        
        if len(self.local_cache[identifier]) >= self.config.max_requests:
            return False
        
        self.local_cache[identifier].append(now)
        return True
    
    def is_whitelisted(self, ip: str) -> bool:
        """Vérification de la liste blanche"""
        if not self.config.whitelist_ips:
            return False
        return ip in self.config.whitelist_ips
    
    def is_blacklisted(self, ip: str) -> bool:
        """Vérification de la liste noire"""
        if not self.config.blacklist_ips:
            return False
        return ip in self.config.blacklist_ips

class RateLimitMiddleware:
    def __init__(self, config: RateLimitConfig):
        self.limiter = RateLimiter(config)
    
    async def __call__(self, request: Request, call_next):
        client_ip = self._get_client_ip(request)
        
        # Vérifier la liste noire
        if self.limiter.is_blacklisted(client_ip):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="IP address is blacklisted"
            )
        
        # Ignorer la limite pour les IPs en liste blanche
        if not self.limiter.is_whitelisted(client_ip):
            if not await self.limiter.check_rate_limit(client_ip):
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded",
                    headers={"Retry-After": str(self.limiter.config.window_seconds)}
                )
        
        response = await call_next(request)
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Récupération de l'IP cliente"""
        # Vérifier les headers de proxy
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host
```

### Configurations par Endpoint
```python
# wakedock/security/rate_limit_configs.py
from wakedock.security.rate_limit import RateLimitConfig

# Configuration par défaut
DEFAULT_RATE_LIMIT = RateLimitConfig(
    max_requests=100,
    window_seconds=300,
    burst_limit=10
)

# Configuration pour l'authentification
AUTH_RATE_LIMIT = RateLimitConfig(
    max_requests=5,
    window_seconds=300,
    burst_limit=2
)

# Configuration pour les APIs sensibles
SENSITIVE_API_RATE_LIMIT = RateLimitConfig(
    max_requests=20,
    window_seconds=60,
    burst_limit=5
)

# Configuration pour les uploads
UPLOAD_RATE_LIMIT = RateLimitConfig(
    max_requests=10,
    window_seconds=600,
    burst_limit=3
)
```

## 🔐 CSRF Protection Middleware

### Implementation
```python
# wakedock/security/csrf.py
import secrets
import hmac
import hashlib
from typing import Optional
from fastapi import Request, HTTPException, status
from datetime import datetime, timedelta

class CSRFProtection:
    def __init__(self, secret_key: str, token_expiry: int = 3600):
        self.secret_key = secret_key
        self.token_expiry = token_expiry
    
    def generate_token(self, session_id: str) -> str:
        """Génération d'un token CSRF"""
        timestamp = str(int(datetime.utcnow().timestamp()))
        token_data = f"{session_id}:{timestamp}"
        
        signature = hmac.new(
            self.secret_key.encode(),
            token_data.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return f"{token_data}:{signature}"
    
    def validate_token(self, token: str, session_id: str) -> bool:
        """Validation d'un token CSRF"""
        try:
            parts = token.split(":")
            if len(parts) != 3:
                return False
            
            received_session, timestamp, signature = parts
            
            # Vérifier la session
            if received_session != session_id:
                return False
            
            # Vérifier l'expiration
            token_time = datetime.fromtimestamp(int(timestamp))
            if datetime.utcnow() - token_time > timedelta(seconds=self.token_expiry):
                return False
            
            # Vérifier la signature
            expected_signature = hmac.new(
                self.secret_key.encode(),
                f"{received_session}:{timestamp}".encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(signature, expected_signature)
            
        except (ValueError, IndexError):
            return False
    
    def extract_token_from_request(self, request: Request) -> Optional[str]:
        """Extraction du token CSRF depuis la requête"""
        # Chercher dans les headers
        token = request.headers.get("X-CSRF-Token")
        if token:
            return token
        
        # Chercher dans les cookies
        token = request.cookies.get("csrf_token")
        if token:
            return token
        
        # Chercher dans les données de formulaire
        if hasattr(request, 'form'):
            form_data = await request.form()
            return form_data.get("csrf_token")
        
        return None

class CSRFMiddleware:
    def __init__(self, csrf_protection: CSRFProtection):
        self.csrf = csrf_protection
        self.safe_methods = {"GET", "HEAD", "OPTIONS", "TRACE"}
    
    async def __call__(self, request: Request, call_next):
        # Ignorer les méthodes sûres
        if request.method in self.safe_methods:
            response = await call_next(request)
            return response
        
        # Vérifier Origin/Referer
        if not self._validate_origin(request):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid origin"
            )
        
        # Vérifier le token CSRF
        session_id = self._get_session_id(request)
        if not session_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No session found"
            )
        
        csrf_token = self.csrf.extract_token_from_request(request)
        if not csrf_token or not self.csrf.validate_token(csrf_token, session_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid CSRF token"
            )
        
        response = await call_next(request)
        return response
    
    def _validate_origin(self, request: Request) -> bool:
        """Validation de l'origine de la requête"""
        origin = request.headers.get("Origin")
        referer = request.headers.get("Referer")
        
        if not origin and not referer:
            return False
        
        # Vérifier que l'origine correspond au host
        expected_origin = f"{request.url.scheme}://{request.url.netloc}"
        
        if origin and origin != expected_origin:
            return False
        
        if referer and not referer.startswith(expected_origin):
            return False
        
        return True
    
    def _get_session_id(self, request: Request) -> Optional[str]:
        """Récupération de l'ID de session"""
        return request.cookies.get("session_id")
```

## 🔒 Security Headers Middleware

### Implementation
```python
# wakedock/security/headers.py
from fastapi import Request, Response

class SecurityHeadersMiddleware:
    def __init__(self):
        self.headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": self._build_csp(),
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
        }
    
    def _build_csp(self) -> str:
        """Construction de la Content Security Policy"""
        csp_directives = {
            "default-src": "'self'",
            "script-src": "'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src": "'self' 'unsafe-inline'",
            "img-src": "'self' data: https:",
            "font-src": "'self' data:",
            "connect-src": "'self' ws: wss:",
            "media-src": "'self'",
            "object-src": "'none'",
            "child-src": "'none'",
            "worker-src": "'self'",
            "manifest-src": "'self'",
            "base-uri": "'self'",
            "form-action": "'self'"
        }
        
        return "; ".join([f"{key} {value}" for key, value in csp_directives.items()])
    
    async def __call__(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        # Ajouter les headers de sécurité
        for header, value in self.headers.items():
            response.headers[header] = value
        
        return response
```

## ✅ Request Validation Middleware

### Implementation
```python
# wakedock/security/validation.py
import re
from typing import Any, Dict, List
from fastapi import Request, HTTPException, status
import json

class RequestValidator:
    def __init__(self):
        self.max_content_length = 10 * 1024 * 1024  # 10MB
        self.allowed_content_types = [
            "application/json",
            "application/x-www-form-urlencoded",
            "multipart/form-data"
        ]
        
        # Patterns pour détecter les attaques
        self.malicious_patterns = [
            r"<script[^>]*>.*?</script>",  # XSS
            r"javascript:",               # JavaScript injection
            r"on\w+\s*=",                # Event handlers
            r"union\s+select",           # SQL injection
            r"drop\s+table",             # SQL injection
            r"insert\s+into",            # SQL injection
            r"delete\s+from",            # SQL injection
            r"\.\./",                    # Directory traversal
            r"\.\.\\",                   # Directory traversal
        ]
    
    def validate_content_type(self, request: Request) -> bool:
        """Validation du type de contenu"""
        content_type = request.headers.get("Content-Type", "")
        
        if not content_type:
            return True  # Pas de contenu
        
        # Extraire le type principal
        main_type = content_type.split(";")[0].strip()
        return main_type in self.allowed_content_types
    
    def validate_content_length(self, request: Request) -> bool:
        """Validation de la taille du contenu"""
        content_length = request.headers.get("Content-Length")
        
        if not content_length:
            return True
        
        try:
            length = int(content_length)
            return length <= self.max_content_length
        except ValueError:
            return False
    
    def scan_for_malicious_content(self, data: str) -> List[str]:
        """Scan pour contenu malveillant"""
        found_patterns = []
        
        for pattern in self.malicious_patterns:
            if re.search(pattern, data, re.IGNORECASE):
                found_patterns.append(pattern)
        
        return found_patterns
    
    def sanitize_input(self, data: Any) -> Any:
        """Sanitisation des données d'entrée"""
        if isinstance(data, str):
            # Encoder les caractères dangereux
            data = data.replace("<", "&lt;")
            data = data.replace(">", "&gt;")
            data = data.replace("&", "&amp;")
            data = data.replace('"', "&quot;")
            data = data.replace("'", "&#x27;")
            return data
        
        elif isinstance(data, dict):
            return {key: self.sanitize_input(value) for key, value in data.items()}
        
        elif isinstance(data, list):
            return [self.sanitize_input(item) for item in data]
        
        return data

class ValidationMiddleware:
    def __init__(self):
        self.validator = RequestValidator()
    
    async def __call__(self, request: Request, call_next):
        # Valider le type de contenu
        if not self.validator.validate_content_type(request):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid content type"
            )
        
        # Valider la taille du contenu
        if not self.validator.validate_content_length(request):
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Content too large"
            )
        
        # Valider le contenu pour les requêtes avec body
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.body()
                if body:
                    body_str = body.decode('utf-8')
                    
                    # Scanner pour contenu malveillant
                    malicious_patterns = self.validator.scan_for_malicious_content(body_str)
                    if malicious_patterns:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Malicious content detected"
                        )
            
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid character encoding"
                )
        
        response = await call_next(request)
        return response
```

## 📊 Audit Logging Middleware

### Implementation
```python
# wakedock/security/audit.py
import json
import time
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import Request, Response
from wakedock.database.models import SecurityAuditLog

class AuditLogger:
    def __init__(self):
        self.sensitive_endpoints = [
            "/api/v1/auth/login",
            "/api/v1/auth/logout",
            "/api/v1/users",
            "/api/v1/containers",
            "/api/v1/system"
        ]
        
        self.sensitive_headers = [
            "authorization",
            "x-api-key",
            "cookie"
        ]
    
    async def log_security_event(
        self,
        event_type: str,
        request: Request,
        response: Optional[Response] = None,
        user_id: Optional[str] = None,
        additional_data: Optional[Dict[str, Any]] = None
    ):
        """Enregistrement d'un événement de sécurité"""
        
        # Préparer les données de base
        audit_data = {
            "event_type": event_type,
            "timestamp": datetime.utcnow(),
            "ip_address": self._get_client_ip(request),
            "user_agent": request.headers.get("User-Agent", ""),
            "method": request.method,
            "url": str(request.url),
            "user_id": user_id,
            "session_id": request.cookies.get("session_id"),
            "request_id": request.headers.get("X-Request-ID"),
            "status_code": response.status_code if response else None,
            "response_time": getattr(request.state, 'response_time', None),
            "additional_data": additional_data or {}
        }
        
        # Ajouter les headers filtrés
        audit_data["headers"] = self._filter_sensitive_headers(dict(request.headers))
        
        # Sauvegarder en base de données
        audit_log = SecurityAuditLog(**audit_data)
        await audit_log.save()
    
    def _get_client_ip(self, request: Request) -> str:
        """Récupération de l'IP cliente"""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host
    
    def _filter_sensitive_headers(self, headers: Dict[str, str]) -> Dict[str, str]:
        """Filtrage des headers sensibles"""
        filtered = {}
        
        for key, value in headers.items():
            if key.lower() in self.sensitive_headers:
                filtered[key] = "[REDACTED]"
            else:
                filtered[key] = value
        
        return filtered
    
    def should_audit_endpoint(self, path: str) -> bool:
        """Vérifier si l'endpoint doit être audité"""
        return any(path.startswith(endpoint) for endpoint in self.sensitive_endpoints)

class AuditMiddleware:
    def __init__(self):
        self.logger = AuditLogger()
    
    async def __call__(self, request: Request, call_next):
        start_time = time.time()
        
        # Vérifier si l'endpoint nécessite un audit
        should_audit = self.logger.should_audit_endpoint(request.url.path)
        
        if should_audit:
            await self.logger.log_security_event(
                "request_start",
                request,
                additional_data={"endpoint": request.url.path}
            )
        
        try:
            response = await call_next(request)
            
            # Calculer le temps de réponse
            response_time = time.time() - start_time
            request.state.response_time = response_time
            
            if should_audit:
                await self.logger.log_security_event(
                    "request_complete",
                    request,
                    response,
                    additional_data={
                        "endpoint": request.url.path,
                        "response_time": response_time
                    }
                )
            
            return response
            
        except Exception as e:
            response_time = time.time() - start_time
            
            if should_audit:
                await self.logger.log_security_event(
                    "request_error",
                    request,
                    additional_data={
                        "endpoint": request.url.path,
                        "error": str(e),
                        "response_time": response_time
                    }
                )
            
            raise
```

## 🔧 Configuration et Intégration

### Configuration Centralisée
```python
# wakedock/security/config.py
from pydantic import BaseSettings
from typing import List

class SecuritySettings(BaseSettings):
    # Rate Limiting
    rate_limit_enabled: bool = True
    rate_limit_max_requests: int = 100
    rate_limit_window_seconds: int = 300
    
    # CSRF Protection
    csrf_protection_enabled: bool = True
    csrf_token_expiry: int = 3600
    
    # Security Headers
    security_headers_enabled: bool = True
    hsts_max_age: int = 31536000
    
    # Request Validation
    request_validation_enabled: bool = True
    max_content_length: int = 10 * 1024 * 1024
    
    # Audit Logging
    audit_logging_enabled: bool = True
    audit_sensitive_endpoints: List[str] = [
        "/api/v1/auth/login",
        "/api/v1/auth/logout"
    ]
    
    class Config:
        env_prefix = "SECURITY_"
        env_file = ".env"

security_settings = SecuritySettings()
```

### Intégration dans FastAPI
```python
# wakedock/main.py
from fastapi import FastAPI
from wakedock.security.middleware import SecurityMiddlewareStack
from wakedock.security.config import security_settings

app = FastAPI()

# Ajouter la pile de middleware de sécurité
security_stack = SecurityMiddlewareStack(security_settings)
security_stack.add_to_app(app)

# Routes de l'application
@app.get("/")
async def root():
    return {"message": "WakeDock API"}
```

### Stack de Middleware
```python
# wakedock/security/middleware.py
from fastapi import FastAPI
from wakedock.security.rate_limit import RateLimitMiddleware, RateLimitConfig
from wakedock.security.csrf import CSRFMiddleware, CSRFProtection
from wakedock.security.headers import SecurityHeadersMiddleware
from wakedock.security.validation import ValidationMiddleware
from wakedock.security.audit import AuditMiddleware

class SecurityMiddlewareStack:
    def __init__(self, settings):
        self.settings = settings
    
    def add_to_app(self, app: FastAPI):
        """Ajout de tous les middleware de sécurité"""
        
        # Audit Logging (en premier pour capturer tout)
        if self.settings.audit_logging_enabled:
            app.add_middleware(AuditMiddleware)
        
        # Rate Limiting
        if self.settings.rate_limit_enabled:
            rate_config = RateLimitConfig(
                max_requests=self.settings.rate_limit_max_requests,
                window_seconds=self.settings.rate_limit_window_seconds
            )
            app.add_middleware(RateLimitMiddleware, config=rate_config)
        
        # CSRF Protection
        if self.settings.csrf_protection_enabled:
            csrf_protection = CSRFProtection(
                secret_key=self.settings.jwt_secret,
                token_expiry=self.settings.csrf_token_expiry
            )
            app.add_middleware(CSRFMiddleware, csrf_protection=csrf_protection)
        
        # Security Headers
        if self.settings.security_headers_enabled:
            app.add_middleware(SecurityHeadersMiddleware)
        
        # Request Validation
        if self.settings.request_validation_enabled:
            app.add_middleware(ValidationMiddleware)
```

## 📊 Monitoring et Métriques

### Endpoint de Métriques Sécurité
```python
@app.get("/api/v1/security/metrics")
async def security_metrics():
    """Métriques de sécurité"""
    return {
        "rate_limit_hits": await get_rate_limit_hits(),
        "csrf_failures": await get_csrf_failures(),
        "malicious_requests_blocked": await get_malicious_requests_blocked(),
        "audit_events_last_hour": await get_audit_events_count(hours=1)
    }
```

---

*Ces spécifications middleware fournissent une protection complète pour l'application WakeDock.*