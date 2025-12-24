class CreateEventDto {
  constructor(data) {
    this.title = data.title;
    this.description = data.description;
    this.date = data.date;
    this.time = data.time;
    this.location = data.location;
  }

  static fromRequest(req) {
    return new CreateEventDto({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      time: req.body.time,
      location: req.body.location,
    });
  }
}

module.exports = CreateEventDto;
