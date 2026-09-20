import { StorageArea } from '../../config/storage.config';

export type StorageFailureReason =
  | 'unavailable'
  | 'quota-exceeded'
  | 'serialization-failed'
  | 'deserialization-failed'
  | 'validation-failed';

export interface StorageFailure {
  reason: StorageFailureReason;
  key?: string;
  area: StorageArea;
}

export type StorageValidator<T> = (value: unknown) => value is T;

export interface StorageReadOptions<T> {
  area?: StorageArea;

  /**
   * Optional runtime validation.
   *
   * Remember that get<MyType>() alone does not
   * validate JSON at runtime.
   */
  validate?: StorageValidator<T>;
}

export interface StorageWriteOptions {
  area?: StorageArea;

  /**
   * Optional time-to-live in milliseconds.
   *
   * Example:
   * 5 * 60 * 1000 = five minutes
   */
  ttlMs?: number;
}

export interface StoredEnvelope<T> {
  storedAt: number;

  expiresAt: number | null;

  value: T;
}
