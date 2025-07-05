import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentClassroomDetailComponent } from './student-classroom-detail.component';

describe('StudentClassroomDetailComponent', () => {
  let component: StudentClassroomDetailComponent;
  let fixture: ComponentFixture<StudentClassroomDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentClassroomDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentClassroomDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
