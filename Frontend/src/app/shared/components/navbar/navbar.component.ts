import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  activeTab: 'organized' | 'invited' = 'organized';
  private routerSubscription?: Subscription;

  @Output() createEventClick = new EventEmitter<void>();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.setActiveTabFromUrl(this.router.url);
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.setActiveTabFromUrl(event.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  onCreateEventClick(): void {
    this.createEventClick.emit();
  }

  setActiveTab(tab: 'organized' | 'invited'): void {
    this.activeTab = tab;
  }

  private setActiveTabFromUrl(url: string): void {
    this.activeTab = url.includes('/events/invited') ? 'invited' : 'organized';
  }

  logout(): void {
    this.authService.logout();
    console.log('Logging out...');
  }
}
