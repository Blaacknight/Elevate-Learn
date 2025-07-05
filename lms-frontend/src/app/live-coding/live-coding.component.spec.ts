import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LiveCodingComponent } from './live-coding.component';
import { FormsModule } from '@angular/forms';

describe('LiveCodingComponent', () => {
  let component: LiveCodingComponent;
  let fixture: ComponentFixture<LiveCodingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveCodingComponent ],
      imports: [ FormsModule ]  // Import FormsModule for two-way binding (ngModel)
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveCodingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update code and input values', () => {
    component.code = 'console.log("Hello, World!")';
    component.input = 'Test input';
    fixture.detectChanges();

    expect(component.code).toBe('console.log("Hello, World!")');
    expect(component.input).toBe('Test input');
  });

  it('should call runCode method and set loading to true', () => {
    spyOn(component, 'runCode').and.callThrough();
    component.runCode();
    expect(component.loading).toBeTrue();
  });

  it('should set output when runCode finishes', async () => {
    component.code = 'console.log("Test Output")';
    component.input = 'Test input';
    component.runCode();
    
    // Simulate a delay and check the output
    setTimeout(() => {
      expect(component.output).toContain('Test Output');
    }, 3000);
  });
});
