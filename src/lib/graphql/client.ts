/**
 * GraphQL client for WakeDock
 */

import { Client, cacheExchange, fetchExchange, subscriptionExchange } from '@urql/core';
import { createClient as createWSClient } from 'graphql-ws';
import { authExchange } from '@urql/exchange-auth';
import { requestPolicyExchange } from '@urql/exchange-request-policy';
import { retryExchange } from '@urql/exchange-retry';
import { offlineExchange } from '@urql/exchange-graphcache';
import { makeDefaultStorage } from '@urql/exchange-graphcache/default-storage';

// Storage for offline capabilities
const storage = makeDefaultStorage({
  idbName: 'wakedock-graphql-cache',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// WebSocket client for subscriptions
const wsClient = createWSClient({
  url: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/graphql`,
  connectionParams: () => {
    const token = localStorage.getItem('access_token');
    return token ? { authorization: `Bearer ${token}` } : {};
  },
});

// Create GraphQL client
export const graphqlClient = new Client({
  url: '/api/v1/graphql',
  exchanges: [
    // Request policy exchange for cache control
    requestPolicyExchange({
      shouldUpgrade: (op) => op.context.requestPolicy !== 'cache-only',
    }),
    
    // Authentication exchange
    authExchange(async (utils) => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      return {
        addAuthToOperation: (operation) => {
          if (!token) return operation;
          
          return utils.appendHeaders(operation, {
            Authorization: `Bearer ${token}`,
          });
        },
        
        willAuthError: (authState) => {
          if (!token) return true;
          
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
          } catch {
            return true;
          }
        },
        
        didAuthError: (error) => {
          return error.graphQLErrors.some(err => err.extensions?.code === 'UNAUTHENTICATED');
        },
        
        refreshAuth: async () => {
          if (!refreshToken) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return;
          }
          
          try {
            const response = await fetch('/api/v1/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });
            
            if (response.ok) {
              const data = await response.json();
              localStorage.setItem('access_token', data.access_token);
              localStorage.setItem('refresh_token', data.refresh_token);
            } else {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              window.location.href = '/login';
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        },
      };
    }),
    
    // Retry exchange for failed requests
    retryExchange({
      initialDelayMs: 1000,
      maxDelayMs: 15000,
      randomDelay: true,
      maxNumberAttempts: 3,
      retryIf: (error) => {
        return error && error.networkError;
      },
    }),
    
    // Offline exchange with normalized cache
    offlineExchange({
      storage,
      schema: `
        type Container {
          id: ID!
          name: String!
          image: String!
          status: String!
          created: String!
        }
        
        type Service {
          id: ID!
          name: String!
          image: String!
          status: String!
          replicas: Int!
        }
        
        type Network {
          id: ID!
          name: String!
          driver: String!
          scope: String!
        }
        
        type Volume {
          name: String!
          driver: String!
          mountpoint: String!
          created: String!
        }
      `,
      resolvers: {
        Container: {
          uptime: (parent) => {
            if (parent.started && parent.status === 'running') {
              const now = new Date();
              const started = new Date(parent.started);
              const diff = now.getTime() - started.getTime();
              return Math.floor(diff / 1000);
            }
            return null;
          },
        },
        Service: {
          runningReplicas: (parent) => {
            // This would be populated by the server
            return parent.runningReplicas || 0;
          },
        },
      },
      updates: {
        Mutation: {
          startContainer: (result, args, cache) => {
            if (result.startContainer) {
              cache.updateQuery(
                { query: 'query { containers { id name status } }' },
                (data) => {
                  if (data?.containers) {
                    const containers = data.containers.map((container: any) =>
                      container.id === result.startContainer.id
                        ? { ...container, status: 'running' }
                        : container
                    );
                    return { ...data, containers };
                  }
                  return data;
                }
              );
            }
          },
          
          stopContainer: (result, args, cache) => {
            if (result.stopContainer) {
              cache.updateQuery(
                { query: 'query { containers { id name status } }' },
                (data) => {
                  if (data?.containers) {
                    const containers = data.containers.map((container: any) =>
                      container.id === result.stopContainer.id
                        ? { ...container, status: 'stopped' }
                        : container
                    );
                    return { ...data, containers };
                  }
                  return data;
                }
              );
            }
          },
          
          removeContainer: (result, args, cache) => {
            if (result.removeContainer) {
              cache.updateQuery(
                { query: 'query { containers { id name status } }' },
                (data) => {
                  if (data?.containers) {
                    const containers = data.containers.filter(
                      (container: any) => container.id !== args.containerId
                    );
                    return { ...data, containers };
                  }
                  return data;
                }
              );
            }
          },
          
          createService: (result, args, cache) => {
            if (result.createService) {
              cache.updateQuery(
                { query: 'query { services { id name status } }' },
                (data) => {
                  if (data?.services) {
                    return {
                      ...data,
                      services: [...data.services, result.createService],
                    };
                  }
                  return data;
                }
              );
            }
          },
        },
        
        Subscription: {
          containerEvents: (result, args, cache) => {
            if (result.containerEvents) {
              cache.updateQuery(
                { query: 'query { containers { id name status } }' },
                (data) => {
                  if (data?.containers) {
                    const existingIndex = data.containers.findIndex(
                      (container: any) => container.id === result.containerEvents.id
                    );
                    
                    if (existingIndex >= 0) {
                      const containers = [...data.containers];
                      containers[existingIndex] = result.containerEvents;
                      return { ...data, containers };
                    } else {
                      return {
                        ...data,
                        containers: [...data.containers, result.containerEvents],
                      };
                    }
                  }
                  return data;
                }
              );
            }
          },
        },
      },
    }),
    
    // Cache exchange
    cacheExchange,
    
    // Fetch exchange for HTTP requests
    fetchExchange,
    
    // Subscription exchange for WebSocket subscriptions
    subscriptionExchange({
      forwardSubscription: (operation) => ({
        subscribe: (sink) => ({
          unsubscribe: wsClient.subscribe(operation, sink),
        }),
      }),
    }),
  ],
  
  // Request policy for cache-first approach
  requestPolicy: 'cache-first',
  
  // Enable subscriptions
  suspense: false,
});

// Helper function to execute queries with error handling
export const executeQuery = async (query: string, variables?: any) => {
  try {
    const result = await graphqlClient.query(query, variables).toPromise();
    
    if (result.error) {
      console.error('GraphQL Error:', result.error);
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
};

// Helper function to execute mutations with error handling
export const executeMutation = async (mutation: string, variables?: any) => {
  try {
    const result = await graphqlClient.mutation(mutation, variables).toPromise();
    
    if (result.error) {
      console.error('GraphQL Mutation Error:', result.error);
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error('Mutation execution error:', error);
    throw error;
  }
};

// Helper function to subscribe to GraphQL subscriptions
export const subscribe = (subscription: string, variables?: any) => {
  return graphqlClient.subscription(subscription, variables);
};

// Cache management utilities
export const invalidateCache = (queries: string[]) => {
  queries.forEach(query => {
    graphqlClient.reexecuteOperation(
      graphqlClient.createRequestOperation('query', {
        query,
      })
    );
  });
};

export const clearCache = () => {
  storage.clear();
};

// Network status utilities
export const getNetworkStatus = () => {
  return navigator.onLine;
};

// Batch query execution
export const executeBatchQueries = async (queries: Array<{ query: string; variables?: any }>) => {
  const promises = queries.map(({ query, variables }) => 
    executeQuery(query, variables)
  );
  
  return Promise.all(promises);
};

// Request policy helpers
export const setCachePolicy = (policy: 'cache-first' | 'cache-only' | 'network-only' | 'cache-and-network') => {
  graphqlClient.requestPolicy = policy;
};

export const refreshQuery = (query: string, variables?: any) => {
  return graphqlClient.query(query, variables, { requestPolicy: 'network-only' }).toPromise();
};

// Export client instance
export default graphqlClient;