import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyClassroomComponent } from './my-classroom.component';

describe('MyClassroomComponent', () => {
  let component: MyClassroomComponent;
  let fixture: ComponentFixture<MyClassroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyClassroomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyClassroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
