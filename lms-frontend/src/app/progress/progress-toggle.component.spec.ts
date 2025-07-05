import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressToggleComponent } from './progress-toggle.component';

describe('ProgressToggleComponent', () => {
  let component: ProgressToggleComponent;
  let fixture: ComponentFixture<ProgressToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressToggleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
