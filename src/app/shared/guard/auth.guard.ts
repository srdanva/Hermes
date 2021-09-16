import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { CanActivate } from '@angular/router';
import { RouterStateSnapshot } from '@angular/router';
import { CanActivateChild } from '@angular/router';
import { Router } from '@angular/router';

// Module
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (state.url === '/') {
      this.router.navigate(['']);
      return false;
    }

    if (route.queryParams.shared) {
      return true;
    }

    if (this.canActivateUrl(state)) {
      return true;
    }

    this.router.navigate(['']);
    return false;
  }

  public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivateUrl(state);
  }

  private canActivateUrl(state: RouterStateSnapshot): boolean {
    return this.authService.isLoggedIn();
  }
}
