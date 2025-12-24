import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Event as EventModel, EventStatus } from '../../../../core/models/event.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.css'
})
export class EventCardComponent {
  @Input() event!: EventModel;

  @Output() deleteEvent = new EventEmitter<EventModel>();
  @Output() updateStatus = new EventEmitter<{ eventId: string; status: EventStatus }>();
  @Output() viewParticipants = new EventEmitter<EventModel>();
  @Output() createInvitation = new EventEmitter<EventModel>();

  showActions = false;
  EventStatus = EventStatus;

  constructor(private router: Router) {}

  // Click outside actions → open event (blocked)
  onCardClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('.event-actions')) return;
  }

  toggleActions(event: MouseEvent): void {
    event.stopPropagation();
    this.showActions = !this.showActions;
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteEvent.emit(this.event);
    this.showActions = false;
  }

  onUpdateStatus(event: MouseEvent, status: EventStatus): void {
    event.stopPropagation();
    this.updateStatus.emit({ eventId: this.event.id, status });
    this.showActions = false;
  }

  onViewParticipants(event: MouseEvent): void {
    event.stopPropagation();
    this.viewParticipants.emit(this.event);
    this.showActions = false;
  }

  onCreateInvitation(event: MouseEvent): void {
    event.stopPropagation();
    this.createInvitation.emit(this.event);
    this.showActions = false;
  }

  getStatusClass(): string {
    switch (this.event.status) {
      case EventStatus.ACTIVE: return 'status-active';
      case EventStatus.CANCELLED: return 'status-cancelled';
      case EventStatus.POSTPONED: return 'status-postponed';
      default: return '';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
