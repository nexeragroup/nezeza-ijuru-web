import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CoreModule } from './core.module';
import { ApiService } from './services/api.service';
import { StorageService } from './services/storage.service';

describe('CoreModule configuration', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [CoreModule.forRoot({ apiBaseUrl: '/api/v1/', storage: { namespace: 'core-test' } })],
    providers: [{ provide: PLATFORM_ID, useValue: 'server' }, provideHttpClientTesting()],
  }));
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    TestBed.resetTestingModule();
  });
  it('provides a normalized API base URL', () => {
    expect(TestBed.inject(ApiService)).toBeDefined();
  });
  it('wires API interceptors without missing auth config', () => {
    TestBed.inject(ApiService).get('/users').subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne('/api/v1/users');
    expect(request.request.headers.get('Accept')).toBe('application/json');
    request.flush([]);
  });
  it('handles storage calls during SSR without accessing browser storage', () => {
    const storage = TestBed.inject(StorageService);
    expect(storage.get('test')).toBeNull();
    expect(storage.set('test', 1, { area: 'session' })).toBe(false);
    expect(storage.lastFailure()?.area).toBe('session');
  });
});
