import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { defer, finalize } from 'rxjs';

import { LoadingService } from '../services/loading.service';
import { SKIP_GLOBAL_LOADING } from '../context/loading.context';

export const loadingInterceptor: HttpInterceptorFn = (request, next) => {
  const loading = inject(LoadingService);

  if (request.context.get(SKIP_GLOBAL_LOADING)) {
    return next(request);
  }

  return defer(() => {
    loading.start();

    return next(request).pipe(
      finalize(() => {
        loading.stop();
      }),
    );
  });
};
