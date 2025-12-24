import { Routes} from '@angular/router';
import { SignupComponent } from './features/auth/components/signup/signup.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { EventListComponent } from './features/events/components/event-list/event-list.component';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { InvitedEventsComponent } from './features/events/components/invited-events/invited-events.component';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [noAuthGuard] },
  { path: 'events', component: EventListComponent, canActivate: [authGuard] },
  { path: 'events/invited', component: InvitedEventsComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent }
];

