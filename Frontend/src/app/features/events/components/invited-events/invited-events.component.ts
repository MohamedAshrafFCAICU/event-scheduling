import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import Event, { ResponseStatus, EventStatus, InvitedEvent, SearchFilters } from '../../../../core/models/event.model';
import { EventService } from '../../services/event.service';

@Component({
    selector: 'app-invited-events',
    standalone: true,
    imports: [CommonModule, FormsModule, NavbarComponent],
    templateUrl: './invited-events.component.html',
    styleUrl: './invited-events.component.css'
})
export class InvitedEventsComponent implements OnInit {
    invitedEvents: InvitedEvent[] = [];
    filteredEvents: InvitedEvent[] = [];
    searchQuery = '';
    loading = false;
    error: string | null = null;
    successMessage: string | null = null;
    respondingEventId: string | null = null;
    respondedStatus: Record<string, ResponseStatus> = {};
    currentUserId: string = ''; // ADD THIS - to store current user ID

    ResponseStatus = ResponseStatus;
    EventStatus = EventStatus;

    // Search filters - same as event-list
    searchFilters = {
        keyword: '',
        date: '',
        userStatus: '',
        eventStatus: '',
        role: ''
    };

    showCreateEventModal = false;
    creatingEvent = false;
    createEventError: string | null = null;
    validationErrors: string[] = [];
    newEvent = {
        title: '',
        description: '',
        date: '',
        time: '',
        location: ''
    };

    constructor(private eventService: EventService) { }

    ngOnInit(): void {
        // Get current user ID from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        this.currentUserId = user.id || user.userId; // Adjust based on your user object structure

        console.log('Current User ID:', this.currentUserId);

        this.fetchInvitedEvents();
    }

    fetchInvitedEvents(): void {
        this.loading = true;
        this.error = null;

        this.eventService.getInvitedEvents().subscribe({
            next: (response) => {
                console.log('Raw invited events response:', response);

                // Type assertion and proper mapping
                this.invitedEvents = (response.data.eventsData as any[]).map((event: any) => ({
                    ...event,
                    participantStatus: event.participantStatus || event.status || 'Pending',
                    participantRole: event.participantRole || 'Attendee'
                })) as InvitedEvent[];

                this.filteredEvents = [...this.invitedEvents];
                console.log('Processed invited events:', this.invitedEvents);
                this.loading = false;
            },
            error: () => {
                this.error = 'Failed to load invited events. Please try again.';
                this.loading = false;
            }
        });
    }

    // Search with keyword input
    onSearchChange(): void {
        this.searchFilters.keyword = this.searchQuery.trim();
        this.performSearch();
    }

    // Perform search with all filters - UPDATED to filter invited events only
    performSearch(): void {
        // Check if any filter is set
        const hasFilters =
            this.searchFilters.keyword.trim() ||
            this.searchFilters.date ||
            this.searchFilters.userStatus ||
            this.searchFilters.eventStatus ||
            this.searchFilters.role;

        // If no filters, show all invited events
        if (!hasFilters) {
            this.filteredEvents = [...this.invitedEvents];
            return;
        }

        // Only search if keyword is at least 2 characters (if provided)
        if (this.searchFilters.keyword && this.searchFilters.keyword.length < 2) {
            return;
        }

        this.loading = true;

        // Build search filters object
        const filters: SearchFilters = {};

        if (this.searchFilters.keyword.trim()) {
            filters.keyword = this.searchFilters.keyword.trim();
        }
        if (this.searchFilters.date) {
            filters.date = this.searchFilters.date;
        }
        if (this.searchFilters.userStatus) {
            filters.userStatus = this.searchFilters.userStatus;
        }
        if (this.searchFilters.eventStatus) {
            filters.eventStatus = this.searchFilters.eventStatus;
        }
        if (this.searchFilters.role) {
            filters.role = this.searchFilters.role;
        }

        console.log('Searching with filters:', filters);

        // Use the updated SearchFilters interface
        this.eventService.searchEvents(filters).subscribe({
            next: (response) => {
                console.log('Search response:', response);
                if (response.success && response.data) {
                    // FILTER: Only show events where current user is NOT the organizer (invited events)
                    // AND filter by role if specified (check userRole matches the filter)
                    this.filteredEvents = response.data
                        .filter(event => {
                            // Must not be organizer
                            const notOrganizer = String(event.userId) !== String(this.currentUserId);

                            // If role filter is set, check if userRole matches
                            const roleMatches = !this.searchFilters.role ||
                                event.userRole === this.searchFilters.role;

                            return notOrganizer && roleMatches;
                        })
                        .map(event => ({
                            ...event,
                            participantStatus: event.userStatus || 'Pending',
                            participantRole: event.userRole || 'Attendee'
                        })) as InvitedEvent[];

                    console.log('Filtered to show only invited events (not organized by user):', this.filteredEvents);
                    console.log('Role filter applied:', this.searchFilters.role || 'None');

                    // Log pagination info if available
                    if (response.pagination) {
                        console.log('Pagination:', response.pagination);
                    }
                } else {
                    this.filteredEvents = [];
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Search error:', error);
                this.loading = false;
                // Don't clear results on error, keep showing current events
                if (error.status !== 400) {
                    this.error = 'Failed to search events';
                }
            }
        });
    }

    // Filter change handlers
    onFilterChange(): void {
        this.performSearch();
    }

    // Clear all filters
    clearFilters(): void {
        this.searchQuery = '';
        this.searchFilters = {
            keyword: '',
            date: '',
            userStatus: '',
            eventStatus: '',
            role: ''
        };
        this.filteredEvents = [...this.invitedEvents];
    }

    onRespond(eventId: string, status: ResponseStatus): void {
        this.respondingEventId = eventId;
        this.successMessage = null;
        this.error = null;

        this.eventService.respondToInvitation(eventId, status).subscribe({
            next: () => {
                this.respondedStatus[eventId] = status;
                this.successMessage = 'Response saved: ' + this.getResponseLabel(status);
                this.respondingEventId = null;
            },
            error: () => {
                this.error = 'Failed to send response. Please try again.';
                this.respondingEventId = null;
            }
        });
    }

    hasResponded(eventId: string): boolean {
        return !!this.respondedStatus[eventId];
    }

    getResponseLabel(status: ResponseStatus): string {
        switch (status) {
            case ResponseStatus.GOING:
                return 'Going';
            case ResponseStatus.MAYBE:
                return 'Maybe';
            case ResponseStatus.NOT_GOING:
                return 'Not Going';
            default:
                return 'Pending';
        }
    }

    getParticipantStatusClass(event: InvitedEvent): string {
        const status = event.participantStatus || event.status || 'pending';
        return status.toLowerCase();
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    openCreateEventModal(): void {
        this.newEvent = {
            title: '',
            description: '',
            date: '',
            time: '',
            location: ''
        };
        this.createEventError = null;
        this.validationErrors = [];
        this.showCreateEventModal = true;
    }

    closeCreateEventModal(): void {
        this.showCreateEventModal = false;
        this.newEvent = {
            title: '',
            description: '',
            date: '',
            time: '',
            location: ''
        };
        this.createEventError = null;
        this.validationErrors = [];
    }

    clearErrors(): void {
        if (this.createEventError) {
            this.createEventError = null;
            this.validationErrors = [];
        }
    }

    onCreateEvent(): void {
        if (!this.newEvent.title || !this.newEvent.description || !this.newEvent.date || !this.newEvent.time || !this.newEvent.location) {
            return;
        }

        this.creatingEvent = true;
        this.eventService.createEvent(this.newEvent).subscribe({
            next: (response) => {
                this.successMessage = 'Event created successfully!';
                this.creatingEvent = false;
                this.closeCreateEventModal();
            },
            error: (error) => {
                this.creatingEvent = false;
                this.createEventError = 'Failed to create event';
                this.validationErrors = [];

                if (error?.error?.errors && Array.isArray(error.error.errors)) {
                    this.validationErrors = error.error.errors.map((err: any) => {
                        const field = err.field || err.property || err.path || 'Field';
                        const message = err.message || err.defaultMessage || 'Invalid value';
                        const formattedField = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim();
                        return formattedField + ': ' + message;
                    });
                    this.createEventError = 'Validation failed. Please check the errors below:';
                } else if (error?.error?.message) {
                    this.createEventError = error.error.message;
                } else if (error?.message) {
                    this.createEventError = error.message;
                }
            }
        });
    }
}