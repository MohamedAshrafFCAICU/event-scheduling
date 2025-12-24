class EventsDTO{
    constructor(eventData){ 
        this.id = eventData.id;
        this.title = eventData.title;
        this.description = eventData.description;
        this.date = eventData.date;
        this.time = eventData.time;
        this.location = eventData.location;
        this.status = eventData.status;
        this.userId = eventData.user_id;
        this.createdAt = eventData.created_at;
        this.updatedAt = eventData.updated_at;
    }
}
module.exports = EventsDTO;