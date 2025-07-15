# Spécifications Tests d'Authentification

## 📋 Vue d'ensemble

Ce document détaille les spécifications complètes pour les tests d'authentification de WakeDock, couvrant les tests de sécurité, de charge, d'intégration et d'expérience utilisateur.

## 🏗️ Architecture des Tests

```
Tests d'Authentification
├── Tests de Sécurité
│   ├── Pentests JWT
│   ├── Tests de vulnérabilités
│   ├── Tests de résistance aux attaques
│   └── Audit de sécurité
├── Tests de Charge
│   ├── Tests de montée en charge
│   ├── Tests de stress
│   ├── Tests de concurrence
│   └── Tests de performance
├── Tests d'Intégration
│   ├── Tests API
│   ├── Tests frontend/backend
│   ├── Tests multi-services
│   └── Tests end-to-end
└── Tests UX/UI
    ├── Tests d'interface utilisateur
    ├── Tests d'accessibilité
    ├── Tests de responsive design
    └── Tests d'ergonomie
```

## 🔒 Tests de Sécurité

### 1. Tests de Sécurité JWT

```typescript
// tests/security/jwt-security.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TokenManager } from '../../src/lib/auth/token-manager';
import { AuthService } from '../../src/lib/auth/auth-service';
import { SecurityTestUtils } from '../utils/security-test-utils';

describe('JWT Security Tests', () => {
  let tokenManager: TokenManager;
  let authService: AuthService;
  let securityUtils: SecurityTestUtils;

  beforeEach(() => {
    tokenManager = new TokenManager();
    authService = new AuthService();
    securityUtils = new SecurityTestUtils();
  });

  describe('Token Validation', () => {
    it('should reject tokens with invalid signatures', async () => {
      const validToken = await tokenManager.createToken({ userId: 'user123' });
      const tamperedToken = securityUtils.tamperTokenSignature(validToken);
      
      await expect(tokenManager.validateToken(tamperedToken))
        .rejects.toThrow('Invalid token signature');
    });

    it('should reject expired tokens', async () => {
      const expiredToken = await tokenManager.createToken(
        { userId: 'user123' },
        { expiresIn: -1 }
      );
      
      await expect(tokenManager.validateToken(expiredToken))
        .rejects.toThrow('Token has expired');
    });

    it('should reject tokens with invalid audience', async () => {
      const tokenWithInvalidAudience = await tokenManager.createToken(
        { userId: 'user123' },
        { audience: 'invalid-audience' }
      );
      
      await expect(tokenManager.validateToken(tokenWithInvalidAudience))
        .rejects.toThrow('Invalid audience');
    });

    it('should reject tokens with invalid issuer', async () => {
      const tokenWithInvalidIssuer = await tokenManager.createToken(
        { userId: 'user123' },
        { issuer: 'invalid-issuer' }
      );
      
      await expect(tokenManager.validateToken(tokenWithInvalidIssuer))
        .rejects.toThrow('Invalid issuer');
    });

    it('should reject blacklisted tokens', async () => {
      const token = await tokenManager.createToken({ userId: 'user123' });
      await tokenManager.blacklistToken(token);
      
      await expect(tokenManager.validateToken(token))
        .rejects.toThrow('Token has been revoked');
    });
  });

  describe('Brute Force Protection', () => {
    it('should implement rate limiting for login attempts', async () => {
      const credentials = { username: 'user', password: 'wrongpassword' };
      
      // Tenter 5 connexions avec un mauvais mot de passe
      for (let i = 0; i < 5; i++) {
        await expect(authService.login(credentials))
          .rejects.toThrow('Invalid credentials');
      }
      
      // La 6ème tentative devrait être rate-limitée
      await expect(authService.login(credentials))
        .rejects.toThrow('Too many login attempts');
    });

    it('should implement progressive delays on failed attempts', async () => {
      const credentials = { username: 'user', password: 'wrongpassword' };
      const attemptTimes: number[] = [];
      
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        try {
          await authService.login(credentials);
        } catch (error) {
          attemptTimes.push(Date.now() - startTime);
        }
      }
      
      // Vérifier que les délais augmentent progressivement
      expect(attemptTimes[1]).toBeGreaterThan(attemptTimes[0]);
      expect(attemptTimes[2]).toBeGreaterThan(attemptTimes[1]);
    });
  });

  describe('Session Security', () => {
    it('should invalidate sessions on password change', async () => {
      const user = await authService.login({ username: 'user', password: 'password' });
      const token = user.token;
      
      // Changer le mot de passe
      await authService.changePassword(user.id, 'newpassword');
      
      // Le token devrait être invalidé
      await expect(tokenManager.validateToken(token))
        .rejects.toThrow('Token has been revoked');
    });

    it('should prevent session fixation attacks', async () => {
      const initialSessionId = await authService.getSessionId();
      
      const user = await authService.login({ username: 'user', password: 'password' });
      const newSessionId = await authService.getSessionId();
      
      // L'ID de session devrait changer après la connexion
      expect(newSessionId).not.toBe(initialSessionId);
    });

    it('should implement session timeout', async () => {
      const user = await authService.login({ username: 'user', password: 'password' });
      
      // Simuler une session expirée
      await securityUtils.simulateSessionExpiry(user.sessionId);
      
      await expect(authService.validateSession(user.sessionId))
        .rejects.toThrow('Session has expired');
    });
  });

  describe('CSRF Protection', () => {
    it('should require CSRF tokens for state-changing operations', async () => {
      const user = await authService.login({ username: 'user', password: 'password' });
      
      // Tenter une opération sans token CSRF
      await expect(authService.deleteUser(user.id, { skipCSRF: true }))
        .rejects.toThrow('CSRF token required');
    });

    it('should validate CSRF tokens', async () => {
      const user = await authService.login({ username: 'user', password: 'password' });
      const invalidCSRF = 'invalid-csrf-token';
      
      await expect(authService.deleteUser(user.id, { csrfToken: invalidCSRF }))
        .rejects.toThrow('Invalid CSRF token');
    });
  });

  describe('XSS Protection', () => {
    it('should sanitize user inputs', async () => {
      const maliciousInput = '<script>alert("XSS")</script>';
      
      const result = await authService.updateProfile({
        name: maliciousInput,
        bio: maliciousInput
      });
      
      expect(result.name).not.toContain('<script>');
      expect(result.bio).not.toContain('<script>');
    });

    it('should set secure headers for responses', async () => {
      const response = await authService.login({ username: 'user', password: 'password' });
      
      expect(response.headers['X-Content-Type-Options']).toBe('nosniff');
      expect(response.headers['X-Frame-Options']).toBe('DENY');
      expect(response.headers['X-XSS-Protection']).toBe('1; mode=block');
    });
  });
});
```

### 2. Tests de Vulnérabilités

```typescript
// tests/security/vulnerability-tests.test.ts
describe('Vulnerability Tests', () => {
  describe('SQL Injection', () => {
    it('should prevent SQL injection in login queries', async () => {
      const maliciousUsername = "admin'; DROP TABLE users; --";
      
      await expect(authService.login({
        username: maliciousUsername,
        password: 'password'
      })).rejects.toThrow('Invalid credentials');
      
      // Vérifier que la table existe encore
      const users = await authService.getAllUsers();
      expect(users).toBeDefined();
    });

    it('should prevent SQL injection in search queries', async () => {
      const maliciousSearch = "'; DELETE FROM users WHERE '1'='1";
      
      const results = await authService.searchUsers(maliciousSearch);
      expect(results).toEqual([]);
    });
  });

  describe('NoSQL Injection', () => {
    it('should prevent NoSQL injection in MongoDB queries', async () => {
      const maliciousQuery = { $ne: null };
      
      await expect(authService.findUser(maliciousQuery))
        .rejects.toThrow('Invalid query format');
    });
  });

  describe('Directory Traversal', () => {
    it('should prevent directory traversal in file uploads', async () => {
      const maliciousPath = '../../../etc/passwd';
      
      await expect(authService.uploadAvatar(maliciousPath))
        .rejects.toThrow('Invalid file path');
    });
  });

  describe('Command Injection', () => {
    it('should prevent command injection in system calls', async () => {
      const maliciousCommand = 'user; rm -rf /';
      
      await expect(authService.createUser({ username: maliciousCommand }))
        .rejects.toThrow('Invalid username format');
    });
  });
});
```

### 3. Tests de Résistance aux Attaques

```typescript
// tests/security/attack-resistance.test.ts
describe('Attack Resistance Tests', () => {
  describe('Rainbow Table Attack', () => {
    it('should use strong password hashing with salt', async () => {
      const password = 'password123';
      const hash1 = await authService.hashPassword(password);
      const hash2 = await authService.hashPassword(password);
      
      // Les hachages devraient être différents (sel unique)
      expect(hash1).not.toBe(hash2);
      
      // Mais les deux devraient être valides
      expect(await authService.verifyPassword(password, hash1)).toBe(true);
      expect(await authService.verifyPassword(password, hash2)).toBe(true);
    });

    it('should use sufficient hash iterations', async () => {
      const password = 'password123';
      const startTime = Date.now();
      
      await authService.hashPassword(password);
      const duration = Date.now() - startTime;
      
      // Le hachage devrait prendre au moins 100ms (pour éviter les attaques par force brute)
      expect(duration).toBeGreaterThan(100);
    });
  });

  describe('Timing Attack', () => {
    it('should have consistent timing for valid and invalid users', async () => {
      const timings: number[] = [];
      
      // Tester avec un utilisateur valide
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        try {
          await authService.login({ username: 'validuser', password: 'wrongpassword' });
        } catch (error) {
          timings.push(Date.now() - startTime);
        }
      }
      
      // Tester avec un utilisateur invalide
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        try {
          await authService.login({ username: 'invaliduser', password: 'wrongpassword' });
        } catch (error) {
          timings.push(Date.now() - startTime);
        }
      }
      
      // Les timings devraient être similaires
      const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
      const maxVariance = Math.max(...timings) - Math.min(...timings);
      
      expect(maxVariance).toBeLessThan(avgTime * 0.1); // Variance < 10%
    });
  });
});
```

## ⚡ Tests de Charge

### 1. Tests de Montée en Charge

```typescript
// tests/load/load-tests.test.ts
import { describe, it, expect } from 'vitest';
import { LoadTestRunner } from '../utils/load-test-runner';

describe('Load Tests', () => {
  let loadRunner: LoadTestRunner;

  beforeEach(() => {
    loadRunner = new LoadTestRunner();
  });

  describe('Authentication Load', () => {
    it('should handle 1000 concurrent login requests', async () => {
      const scenario = {
        name: 'Concurrent Login Test',
        virtualUsers: 1000,
        duration: '5m',
        rampUp: '1m',
        requests: [
          {
            method: 'POST',
            url: '/api/auth/login',
            body: { username: 'user{{$randomInt(1, 1000)}}', password: 'password' }
          }
        ]
      };

      const results = await loadRunner.run(scenario);
      
      expect(results.successRate).toBeGreaterThan(0.95); // 95% de succès
      expect(results.averageResponseTime).toBeLessThan(200); // <200ms
      expect(results.p95ResponseTime).toBeLessThan(500); // <500ms pour 95%
      expect(results.errorRate).toBeLessThan(0.05); // <5% d'erreurs
    });

    it('should handle token refresh under load', async () => {
      const scenario = {
        name: 'Token Refresh Load Test',
        virtualUsers: 500,
        duration: '10m',
        stages: [
          { duration: '2m', target: 100 }, // Ramp up to 100 users
          { duration: '5m', target: 100 }, // Stay at 100 users
          { duration: '2m', target: 500 }, // Ramp up to 500 users
          { duration: '1m', target: 0 }    // Ramp down
        ],
        requests: [
          {
            method: 'POST',
            url: '/api/auth/refresh',
            headers: { 'Authorization': 'Bearer {{refreshToken}}' }
          }
        ]
      };

      const results = await loadRunner.run(scenario);
      
      expect(results.successRate).toBeGreaterThan(0.98);
      expect(results.averageResponseTime).toBeLessThan(100);
      expect(results.tokenRefreshRate).toBeLessThan(200); // <200ms pour refresh
    });
  });

  describe('Session Management Load', () => {
    it('should handle concurrent session validation', async () => {
      const scenario = {
        name: 'Session Validation Load Test',
        virtualUsers: 2000,
        duration: '3m',
        requests: [
          {
            method: 'GET',
            url: '/api/auth/validate',
            headers: { 'Authorization': 'Bearer {{accessToken}}' }
          }
        ]
      };

      const results = await loadRunner.run(scenario);
      
      expect(results.successRate).toBeGreaterThan(0.99);
      expect(results.averageResponseTime).toBeLessThan(50);
      expect(results.throughput).toBeGreaterThan(1000); // >1000 req/sec
    });
  });
});
```

### 2. Tests de Stress

```typescript
// tests/load/stress-tests.test.ts
describe('Stress Tests', () => {
  describe('Database Connection Stress', () => {
    it('should handle database connection exhaustion gracefully', async () => {
      const scenario = {
        name: 'Database Connection Stress',
        virtualUsers: 5000,
        duration: '2m',
        requests: [
          {
            method: 'POST',
            url: '/api/auth/login',
            body: { username: 'user{{$randomInt(1, 100)}}', password: 'password' }
          }
        ]
      };

      const results = await loadRunner.run(scenario);
      
      // Même sous stress, le système devrait répondre
      expect(results.successRate).toBeGreaterThan(0.80);
      expect(results.errorTypes['Database connection failed']).toBeLessThan(0.1);
    });
  });

  describe('Memory Stress', () => {
    it('should handle memory pressure during authentication', async () => {
      const scenario = {
        name: 'Memory Stress Test',
        virtualUsers: 1000,
        duration: '5m',
        requests: [
          {
            method: 'POST',
            url: '/api/auth/login',
            body: { username: 'user{{$randomInt(1, 1000)}}', password: 'password' }
          },
          {
            method: 'GET',
            url: '/api/auth/profile',
            headers: { 'Authorization': 'Bearer {{accessToken}}' }
          }
        ]
      };

      const memoryBefore = await loadRunner.getMemoryUsage();
      const results = await loadRunner.run(scenario);
      const memoryAfter = await loadRunner.getMemoryUsage();
      
      // Vérifier qu'il n'y a pas de fuite mémoire majeure
      const memoryIncrease = memoryAfter - memoryBefore;
      expect(memoryIncrease).toBeLessThan(memoryBefore * 0.5); // <50% d'augmentation
      
      expect(results.successRate).toBeGreaterThan(0.85);
    });
  });
});
```

## 🔄 Tests d'Intégration

### 1. Tests d'Intégration API

```typescript
// tests/integration/api-integration.test.ts
describe('API Integration Tests', () => {
  describe('Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      // 1. Enregistrement
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'SecurePass123!'
        });
      
      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body).toHaveProperty('token');

      // 2. Connexion
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'SecurePass123!'
        });
      
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('accessToken');
      expect(loginResponse.body).toHaveProperty('refreshToken');

      const { accessToken, refreshToken } = loginResponse.body;

      // 3. Accès à une ressource protégée
      const protectedResponse = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(protectedResponse.status).toBe(200);
      expect(protectedResponse.body.user.username).toBe('testuser');

      // 4. Refresh du token
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });
      
      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body).toHaveProperty('accessToken');

      // 5. Déconnexion
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(logoutResponse.status).toBe(200);

      // 6. Vérifier que le token est invalidé
      const invalidTokenResponse = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(invalidTokenResponse.status).toBe(401);
    });
  });

  describe('Multi-Service Integration', () => {
    it('should integrate with Docker service', async () => {
      // Connexion
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: 'dockeruser', password: 'password' });
      
      const { accessToken } = loginResponse.body;

      // Utiliser le token pour accéder au service Docker
      const dockerResponse = await request(app)
        .get('/api/docker/containers')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(dockerResponse.status).toBe(200);
      expect(dockerResponse.body).toHaveProperty('containers');
    });

    it('should integrate with Caddy service', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: 'caddyuser', password: 'password' });
      
      const { accessToken } = loginResponse.body;

      // Utiliser le token pour accéder au service Caddy
      const caddyResponse = await request(app)
        .get('/api/caddy/config')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(caddyResponse.status).toBe(200);
      expect(caddyResponse.body).toHaveProperty('config');
    });
  });
});
```

### 2. Tests Frontend/Backend

```typescript
// tests/integration/frontend-backend.test.ts
describe('Frontend/Backend Integration', () => {
  describe('Authentication State Sync', () => {
    it('should sync authentication state between frontend and backend', async () => {
      // Simuler une connexion frontend
      const authStore = new AuthStore();
      const loginResult = await authStore.login('user', 'password');
      
      expect(loginResult.success).toBe(true);
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.user).toBeDefined();

      // Vérifier que le token est valide côté backend
      const backendValidation = await fetch('/api/auth/validate', {
        headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
      });
      
      expect(backendValidation.status).toBe(200);
    });

    it('should handle token refresh transparently', async () => {
      const authStore = new AuthStore();
      await authStore.login('user', 'password');
      
      // Simuler un token expiré
      authStore.accessToken = 'expired-token';
      
      // Faire une requête qui devrait déclencher un refresh
      const response = await authStore.makeAuthenticatedRequest('/api/user/profile');
      
      expect(response.status).toBe(200);
      expect(authStore.accessToken).not.toBe('expired-token'); // Token rafraîchi
    });
  });

  describe('Real-time Updates', () => {
    it('should handle real-time authentication events', async () => {
      const authStore = new AuthStore();
      const eventSpy = vi.fn();
      
      authStore.on('session-expired', eventSpy);
      
      // Simuler une expiration de session côté backend
      await simulateSessionExpiry(authStore.user.id);
      
      // Attendre que l'événement soit propagé
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventSpy).toHaveBeenCalledWith({
        type: 'session-expired',
        reason: 'token-expired'
      });
      expect(authStore.isAuthenticated).toBe(false);
    });
  });
});
```

## 🎨 Tests UX/UI

### 1. Tests d'Interface Utilisateur

```typescript
// tests/ui/authentication-ui.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../components/LoginForm';
import { AuthProvider } from '../contexts/AuthContext';

describe('Authentication UI Tests', () => {
  describe('Login Form', () => {
    it('should display login form correctly', () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );
      
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should show validation errors for invalid inputs', async () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should handle login success', async () => {
      const mockLogin = vi.fn().mockResolvedValue({ success: true });
      
      render(
        <AuthProvider value={{ login: mockLogin }}>
          <LoginForm />
        </AuthProvider>
      );
      
      fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('user', 'password');
      });
    });

    it('should display error message for login failure', async () => {
      const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
      
      render(
        <AuthProvider value={{ login: mockLogin }}>
          <LoginForm />
        </AuthProvider>
      );
      
      fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password Strength Indicator', () => {
    it('should show password strength feedback', () => {
      render(<PasswordStrengthIndicator password="" />);
      
      expect(screen.getByText(/weak/i)).toBeInTheDocument();
      
      // Test avec un mot de passe fort
      render(<PasswordStrengthIndicator password="StrongP@ssw0rd123!" />);
      expect(screen.getByText(/strong/i)).toBeInTheDocument();
    });
  });
});
```

### 2. Tests d'Accessibilité

```typescript
// tests/ui/accessibility.test.ts
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LoginForm } from '../components/LoginForm';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should have no accessibility violations in login form', async () => {
    const { container } = render(<LoginForm />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', () => {
    render(<LoginForm />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    usernameInput.focus();
    expect(document.activeElement).toBe(usernameInput);
    
    fireEvent.keyDown(usernameInput, { key: 'Tab' });
    expect(document.activeElement).toBe(passwordInput);
    
    fireEvent.keyDown(passwordInput, { key: 'Tab' });
    expect(document.activeElement).toBe(submitButton);
  });

  it('should provide appropriate ARIA labels', () => {
    render(<LoginForm />);
    
    expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'Login form');
    expect(screen.getByLabelText(/username/i)).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-required', 'true');
  });
});
```

### 3. Tests de Responsive Design

```typescript
// tests/ui/responsive.test.ts
describe('Responsive Design Tests', () => {
  const breakpoints = {
    mobile: 375,
    tablet: 768,
    desktop: 1024,
    large: 1440
  };

  Object.entries(breakpoints).forEach(([device, width]) => {
    describe(`${device} (${width}px)`, () => {
      beforeEach(() => {
        global.innerWidth = width;
        global.dispatchEvent(new Event('resize'));
      });

      it('should display login form correctly', () => {
        render(<LoginForm />);
        
        const form = screen.getByRole('form');
        const computedStyle = window.getComputedStyle(form);
        
        if (device === 'mobile') {
          expect(computedStyle.width).toBe('100%');
          expect(computedStyle.padding).toBe('16px');
        } else {
          expect(computedStyle.maxWidth).toBe('400px');
          expect(computedStyle.margin).toBe('0 auto');
        }
      });

      it('should handle touch interactions on mobile', () => {
        if (device === 'mobile') {
          render(<LoginForm />);
          
          const submitButton = screen.getByRole('button', { name: /login/i });
          const computedStyle = window.getComputedStyle(submitButton);
          
          // Bouton doit être assez grand pour le touch
          expect(parseInt(computedStyle.minHeight)).toBeGreaterThanOrEqual(44);
        }
      });
    });
  });
});
```

## 📊 Métriques et Reporting

### 1. Configuration des Tests

```typescript
// tests/config/test-config.ts
export const testConfig = {
  security: {
    timeouts: {
      bruteForce: 5000,
      sessionExpiry: 30000
    },
    thresholds: {
      maxLoginAttempts: 5,
      lockoutDuration: 300000, // 5 minutes
      sessionTimeout: 1800000  // 30 minutes
    }
  },
  
  load: {
    thresholds: {
      successRate: 0.95,
      averageResponseTime: 200,
      p95ResponseTime: 500,
      errorRate: 0.05
    },
    scenarios: {
      light: { users: 100, duration: '2m' },
      medium: { users: 500, duration: '5m' },
      heavy: { users: 1000, duration: '10m' }
    }
  },
  
  ui: {
    browsers: ['chrome', 'firefox', 'safari', 'edge'],
    devices: ['desktop', 'tablet', 'mobile'],
    accessibilityLevel: 'AA'
  }
};
```

### 2. Reporting des Tests

```typescript
// tests/utils/test-reporter.ts
export class TestReporter {
  generateSecurityReport(results: SecurityTestResults): SecurityReport {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: results.tests.length,
        passed: results.tests.filter(t => t.passed).length,
        failed: results.tests.filter(t => !t.passed).length,
        securityScore: this.calculateSecurityScore(results)
      },
      vulnerabilities: results.vulnerabilities,
      recommendations: this.generateRecommendations(results)
    };
  }

  generateLoadReport(results: LoadTestResults): LoadReport {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalRequests: results.requestCount,
        successRate: results.successRate,
        averageResponseTime: results.averageResponseTime,
        throughput: results.throughput
      },
      performance: {
        p50: results.percentiles.p50,
        p90: results.percentiles.p90,
        p95: results.percentiles.p95,
        p99: results.percentiles.p99
      },
      errors: results.errors
    };
  }

  private calculateSecurityScore(results: SecurityTestResults): number {
    const totalTests = results.tests.length;
    const passedTests = results.tests.filter(t => t.passed).length;
    const criticalVulnerabilities = results.vulnerabilities.filter(v => v.severity === 'critical').length;
    
    let score = (passedTests / totalTests) * 100;
    
    // Pénalité pour les vulnérabilités critiques
    score -= criticalVulnerabilities * 10;
    
    return Math.max(0, Math.min(100, score));
  }
}
```

## 🎯 Objectifs de Qualité

### 1. Seuils de Sécurité

- **Score de sécurité** : ≥95%
- **Vulnérabilités critiques** : 0
- **Vulnérabilités hautes** : ≤2
- **Temps de réponse auth** : ≤200ms
- **Résistance aux attaques** : 100%

### 2. Seuils de Performance

- **Taux de succès** : ≥95%
- **Temps de réponse moyen** : ≤200ms
- **P95 temps de réponse** : ≤500ms
- **Taux d'erreur** : ≤5%
- **Débit** : ≥1000 req/sec

### 3. Seuils UX

- **Accessibilité** : WCAG 2.1 AA
- **Compatibilité navigateurs** : ≥95%
- **Responsive design** : 100%
- **Temps de chargement** : ≤2s

## 📋 Checklist des Tests

### Tests de Sécurité
- [ ] Tests de validation JWT
- [ ] Tests de résistance aux attaques
- [ ] Tests de vulnérabilités
- [ ] Tests de sessions
- [ ] Tests CSRF/XSS
- [ ] Audit de sécurité

### Tests de Charge
- [ ] Tests de montée en charge
- [ ] Tests de stress
- [ ] Tests de concurrence
- [ ] Tests de performance
- [ ] Tests de scalabilité

### Tests d'Intégration
- [ ] Tests API complets
- [ ] Tests multi-services
- [ ] Tests frontend/backend
- [ ] Tests end-to-end
- [ ] Tests de synchronisation

### Tests UX/UI
- [ ] Tests d'interface
- [ ] Tests d'accessibilité
- [ ] Tests responsive
- [ ] Tests de navigation
- [ ] Tests d'ergonomie

---

*Ces spécifications fournissent une couverture complète des tests d'authentification pour WakeDock.*