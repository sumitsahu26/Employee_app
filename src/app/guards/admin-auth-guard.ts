import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminAuthGuard: CanActivateFn = () => {

  const router = inject(Router);

  const isLoggedIn = localStorage.getItem('adminLoggedIn');

  if (isLoggedIn === 'true') {
    return true;
  }

  return router.createUrlTree(['/admin']);
};