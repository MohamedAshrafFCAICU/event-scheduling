// Event interface
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: EventStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default Event

// InvitedEvent interface (ONLY ONE - removed duplicate)
export interface InvitedEvent extends Event {
  participantStatus?: string;  // Keep as string to match backend
  participantRole?: string;
  invitedAt?: string;
  respondedAt?: string | null;
  hasResponded?: boolean;
}

// Event status enum (LOWERCASE enum)
export enum EventStatus {
  ACTIVE = 'Active',
  CANCELLED = 'Cancelled',
  POSTPONED = 'Postponed'
}

// Response status enum (for participants) (LOWERCASE enum)
export enum ResponseStatus {
  PENDING = 'Pending',
  GOING = 'Going',
  MAYBE = 'Maybe',
  NOT_GOING = 'NotGoing',
}

// Create event request
export interface CreateEvent {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
}

// Update event status
export interface UpdateEventStatus {
  status: EventStatus;
}

export interface Permissions {
  canManageEvent: boolean;
  canInviteOthers: boolean;
  canDeleteEvent: boolean;
}

export interface Participant {
  userId: string;
  eventId: string;  // Fixed typo: was eventide
  role: string;
  status: ResponseStatus;
  invitedAt: string;
  respondedAt: string | null;
  hasResponded: boolean;
  permissions: Permissions;
}

// API Response for single event
export interface EventResponse {
  success: boolean;
  message?: string;
  data: {
    event: Event;
    organizers: Organizer;
  };
}

// API Response for list of events - UPDATED to support both types
export interface EventsListResponse {
  success: boolean;
  message?: string;
  data: {
    eventsData: Event[] | InvitedEvent[];
  };
}

// ParticipantUser interface - FIXED status property
export interface ParticipantUser {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  eventId: number;  // Fixed typo: was eventide
  role: string;
  status: string; // Changed from optional to required
  invitedAt: string;
  respondedAt: string | null;
  fullName?: string;
}

export interface ParticipantsResponse {
  success: boolean;
  message: string;
  data: {
    participantsData: ParticipantUser[];
  };
}

// Update status response
export interface UpdateStatusResponse {
  success: boolean;
  message: string;
  data: {
    participant: Participant;
    event: {
      id: number;
      title: string;
      date: string;
      time: string;
      location: string;
    };
    message: string;
  };
}

export interface InviteUserRequest {
  userId: number;
  role: string;
}

// Invite user response
export interface InviteUserResponse {
  success: boolean;
  message: string;
  data: {
    invitation: Participant;
    event: {
      id: number;
      title: string;
      date: string;
      time: string;
      location: string;
    };
    invitedUser: {
      id: number;
      username: string;
      email: string;
      fullName: string;
    };
    invitedBy: {
      id: number;
      role: string;
    };
  };
}

export interface Organizer {
  userID: string;
  eventID: string;  // Fixed typo: was eventide
  role: string;
  status: EventStatus;
  invitedAt: string;
  respondedAt: string;
  hasResponded: boolean;
  permissions: Permissions;
}

export interface SearchFilters {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  status?: EventStatus;
  role?: string;
}

// Add a new interface for search results
export interface SearchEvent extends Event {
  userRole?: string;      // Role of current user in this event
  userStatus?: string;    // Status of current user for this event
  relevance?: number;     // Search relevance score
  snippet?: string;       // Search result snippet
}

// Update SearchFilters to match backend
export interface SearchFilters {
  keyword?: string;
  date?: string;          // Changed from startDate/endDate
  userStatus?: string;    // Added - filter by user's response status
  eventStatus?: string;   // Changed from 'status'
  role?: string;
}

// Add search response interface
export interface SearchEventsResponse {
  success: boolean;
  data: SearchEvent[];    // Direct array, not wrapped in eventsData
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  searchTerm?: string;
}