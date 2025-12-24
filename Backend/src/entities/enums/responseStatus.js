class ResponseStatus {
  static PENDING = "Pending";
  static GOING = "Going";
  static MAYBE = "Maybe";
  static NOT_GOING = "NotGoing";

  static values() {
    return [
      ResponseStatus.PENDING,
      ResponseStatus.GOING,
      ResponseStatus.MAYBE,
      ResponseStatus.NOT_GOING,
    ];
  }

  static isValid(status) {
    return ResponseStatus.values().includes(status);
  }

  static getDefault() {
    return ResponseStatus.PENDING;
  }

  static parse(status) {
    if (!status) return ResponseStatus.getDefault();

    const upperStatus = status.toUpperCase().replace(/\s+/g, "_");

    switch (upperStatus) {
      case "PENDING":
      case "INVITED":
        return ResponseStatus.PENDING;
      case "GOING":
      case "YES":
      case "ACCEPTED":
      case "COLLABORATOR": // For backward compatibility with old design
        return ResponseStatus.GOING;
      case "MAYBE":
      case "TENTATIVE":
        return ResponseStatus.MAYBE;
      case "NOT_GOING":
      case "NOTGOING":
      case "NO":
      case "DECLINED":
      case "DELETED": // For backward compatibility
        return ResponseStatus.NOT_GOING;
      default:
        throw new Error(`Invalid response status: ${status}`);
    }
  }

  static hasResponded(status) {
    return status !== ResponseStatus.PENDING;
  }
}

// Freeze to prevent modifications
Object.freeze(ResponseStatus);

module.exports = ResponseStatus;
