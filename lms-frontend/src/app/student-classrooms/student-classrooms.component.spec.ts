import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentClassroomsComponent } from './student-classrooms.component';

describe('StudentClassroomsComponent', () => {
  let component: StudentClassroomsComponent;
  let fixture: ComponentFixture<StudentClassroomsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentClassroomsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentClassroomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
