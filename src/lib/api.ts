/**
 * WakeDock API Client (Refactored)
 * 
 * This file now exports the new modular API client.
 * The original 920+ line implementation has been split into focused modules:
 * 
 * - BaseApiClient: Core HTTP functionality
 * - AuthService: Authentication handling
 * - ServicesApi: Docker services management  
 * - SystemApi: System information and health
 * - UsersApi: User management
 * 
 * For backward compatibility, all exports remain the same.
 */

// API layer disabled for v0.6.4 - using mock stores instead
// All API functionality is replaced by stores in /lib/stores/

// Export nothing for now
export { };