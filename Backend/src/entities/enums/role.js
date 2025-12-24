class Role {
  static ORGANIZER = "Organizer";
  static COLLABORATOR = "Collaborator";
  static ATTENDEE = "Attendee";

  static values() {
    return [Role.ORGANIZER, Role.COLLABORATOR, Role.ATTENDEE];
  }

  static isValid(role) {
    return Role.values().includes(role);
  }

  static getDefault() {
    return Role.ATTENDEE;
  }

  static parse(role) {
    if (!role) return Role.getDefault();

    const upperRole = role.toUpperCase();

    switch (upperRole) {
      case "ORGANIZER":
      case "OWNER":
      case "CREATOR":
        return Role.ORGANIZER;
      case "COLLABORATOR":
      case "HELPER":
      case "CO_ORGANIZER":
        return Role.COLLABORATOR;
      case "ATTENDEE":
      case "PARTICIPANT":
      case "GUEST":
        return Role.ATTENDEE;
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  }

  static canManageEvent(role) {
    return role === Role.ORGANIZER || role === Role.COLLABORATOR;
  }

  static canInviteOthers(role) {
    return role === Role.ORGANIZER || role === Role.COLLABORATOR;
  }

  static canDeleteEvent(role) {
    return role === Role.ORGANIZER;
  }
}

// Freeze to prevent modifications
Object.freeze(Role);

module.exports = Role;
