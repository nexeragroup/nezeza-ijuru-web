import { describe, expect, it } from 'vitest';
import { isApiRequest } from './api-url.util';

describe('API request boundary', () => {
  it('matches API paths and queries without including adjacent routes', () => {
    expect(isApiRequest('/api/v1/users?limit=2', '/api/v1')).toBe(true);
    expect(isApiRequest('/api/v1?limit=2', '/api/v1')).toBe(true);
    expect(isApiRequest('/api/v10/users', '/api/v1')).toBe(false);
  });
  it('rejects external, protocol-relative, and traversing URLs', () => {
    for (const url of ['https://other.example/api/v1', '//api/v1/users', '/api/v1/../../private', '/\\other.example/api/v1']) {
      expect(isApiRequest(url, '/api/v1')).toBe(false);
    }
  });
  it('requires the configured absolute API origin and path', () => {
    const base = 'https://api.example.com/api/v1';
    expect(isApiRequest(`${base}/users`, base)).toBe(true);
    expect(isApiRequest('/api/v1/users', base)).toBe(false);
    expect(isApiRequest('https://other.example/api/v1/users', base)).toBe(false);
    expect(isApiRequest('https://api.example.com/api/v10', base)).toBe(false);
  });
});
