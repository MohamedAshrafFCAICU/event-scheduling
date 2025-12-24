import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { EventApiService } from './event-api.service';
import Event, {
  UpdateEventStatus,
  EventStatus,
  InviteUserRequest,
  InviteUserResponse,
  ResponseStatus,
  UpdateStatusResponse,
  EventsListResponse,
  InvitedEvent,
  SearchFilters,
  SearchEventsResponse
} from '../../../core/models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  // State management for organized events
  private organizedEventsSubject = new BehaviorSubject<Event[]>([]);
  public organizedEvents$ = this.organizedEventsSubject.asObservable();

  private invitedEventsSubject = new BehaviorSubject<Event[]>([]);
  public invitedEvents$ = this.invitedEventsSubject.asObservable();

  private selectedEventSubject = new BehaviorSubject<Event | null>(null);
  public selectedEvent$ = this.selectedEventSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private eventApiService: EventApiService) {}

  // Get all organized events
  getAllOrganizedEvents(): Observable<any> {
    console.log('Loading organized events...');
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.eventApiService.getOrganizedEvents().pipe(
      tap(response => {
        if (response.success) {
          console.log('Organized events loaded:', response.data.eventsData);
          this.organizedEventsSubject.next(response.data.eventsData);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error loading organized events:', error);
        this.errorSubject.next(error.message || 'Failed to load events');
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  // Get single event by ID
  getEventById(eventId: string): Observable<any> {
    console.log('Loading event:', eventId);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.eventApiService.getEventById(eventId).pipe(
      tap(response => {
        if (response.success) {
          console.log('Event loaded:', response.data.event);
          this.selectedEventSubject.next(response.data.event);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error loading event:', error);
        this.errorSubject.next(error.message || 'Failed to load event');
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  // Create new event
  createEvent(eventData: any): Observable<any> {
    console.log('Creating event:', eventData);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.eventApiService.createEvent(eventData).pipe(
      tap(response => {
        if (response.success) {
          console.log('Event created:', response.data.event);
          // Add new event to the organized events list
          const currentEvents = this.organizedEventsSubject.value;
          this.organizedEventsSubject.next([response.data.event, ...currentEvents]);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error creating event:', error);
        this.errorSubject.next(error.message || 'Failed to create event');
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  // Update event status
  updateEventStatus(eventId: string, newStatus: EventStatus): Observable<UpdateStatusResponse> {
    console.log('Updating event status:', eventId, newStatus);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const updateData: UpdateEventStatus = { status: newStatus };

    return this.eventApiService.updateEventStatus(eventId, updateData.status).pipe(
      tap((response) => {
        if (response.success) {
          console.log('Event status updated:', response.data.event);

          // Update event in the organized events list
          const currentEvents = this.organizedEventsSubject.value;
          const updatedEvents = currentEvents.map(event =>
            event.id === eventId ? { ...event, status: newStatus } : event
          );
          this.organizedEventsSubject.next(updatedEvents);

          // Update selected event if it's the same
          const selectedEvent = this.selectedEventSubject.value;
          if (selectedEvent && selectedEvent.id === eventId) {
            this.selectedEventSubject.next({ ...selectedEvent, status: newStatus });
          }
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error updating event status:', error);
        this.errorSubject.next(error.message || 'Failed to update event status');
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  // Delete event
  deleteEvent(eventId: string): Observable<any> {
    console.log('Deleting event:', eventId);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.eventApiService.deleteEvent(eventId).pipe(
      tap(response => {
        if (response.success) {
          console.log('Event deleted:', eventId);
          // Remove event from the organized events list
          const currentEvents = this.organizedEventsSubject.value;
          const filteredEvents = currentEvents.filter(event => event.id !== eventId);
          this.organizedEventsSubject.next(filteredEvents);

          // Clear selected event if it's the same
          const selectedEvent = this.selectedEventSubject.value;
          if (selectedEvent && selectedEvent.id === eventId) {
            this.selectedEventSubject.next(null);
          }
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error deleting event:', error);
        this.errorSubject.next(error.message || 'Failed to delete event');
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  // Get event participants/attendees
  getEventParticipants(eventId: string): Observable<any> {
    console.log('Loading participants for event:', eventId);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.eventApiService.getEventParticipants(eventId).pipe(
      tap(response => {
        console.log('Participants loaded:', response);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error loading participants:', error);
        this.errorSubject.next(error.message || 'Failed to load participants');
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  // Invite user to event
  inviteUser(eventId: string, inviteData: InviteUserRequest): Observable<InviteUserResponse> {
    console.log('Inviting user to event:', eventId, inviteData);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.eventApiService.inviteUser(eventId, inviteData).pipe(
      tap(response => {
        if (response.success) {
          console.log('User invited successfully:', response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error inviting user:', error);
        this.errorSubject.next(error.message || 'Failed to invite user');
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  // Get invited events for current user
  getInvitedEvents(): Observable<EventsListResponse> {
    console.log('Loading invited events...');
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.eventApiService.getInvitedEvents().pipe(
      tap(response => {
        if (response.success) {
          // Type assertion to handle the union type
          const invitedEvents = response.data.eventsData as any[];
          this.invitedEventsSubject.next(invitedEvents as Event[]);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error loading invited events:', error);
        this.errorSubject.next(error.message || 'Failed to load invited events');
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  // Respond to an invitation
  respondToInvitation(eventId: string, status: ResponseStatus): Observable<UpdateStatusResponse> {
    console.log('Responding to invitation:', eventId, status);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.eventApiService.respondToInvitation(eventId, status).pipe(
      tap(response => {
        if (response.success) {
          console.log('Invitation response saved');
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error responding to invitation:', error);
        this.errorSubject.next(error.message || 'Failed to submit response');
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  // Get current organized events from state
  getCurrentOrganizedEvents(): Event[] {
    return this.organizedEventsSubject.value;
  }

  // Get selected event from state
  getSelectedEvent(): Event | null {
    return this.selectedEventSubject.value;
  }

  // Set selected event
  setSelectedEvent(event: Event): void {
    this.selectedEventSubject.next(event);
  }

  // Clear selected event
  clearSelectedEvent(): void {
    this.selectedEventSubject.next(null);
  }

  // Clear error
  clearError(): void {
    this.errorSubject.next(null);
  }

  // Refresh organized events
  refreshOrganizedEvents(): void {
    this.getAllOrganizedEvents().subscribe();
  }

  // Search events with filters
  searchEvents(filters: SearchFilters): Observable<SearchEventsResponse> {
    console.log('Searching events with filters:', filters);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.eventApiService.searchEvents(filters).pipe(
      tap(response => {
        if (response.success) {
          console.log('Search results loaded:', response.data);
          console.log('Pagination:', response.pagination);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error searching events:', error);
        this.errorSubject.next(error.message || 'Failed to search events');
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }
}
