import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitedEventsComponent } from './invited-events.component';

describe('InvitedEventsComponent', () => {
  let component: InvitedEventsComponent;
  let fixture: ComponentFixture<InvitedEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitedEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitedEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
