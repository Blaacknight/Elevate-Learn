import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassroomManagementComponent } from './classroom-management.component';

describe('ClassroomManagementComponent', () => {
  let component: ClassroomManagementComponent;
  let fixture: ComponentFixture<ClassroomManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassroomManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassroomManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
