import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css']
})
export class ProgressBarComponent implements OnChanges {
  @Input() courseId = '';
  @Input() percent: number | null = null; // <-- support dynamic updates

  constructor(private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['courseId'] && this.courseId && this.percent === null) {
      this.loadProgress(); // only load if not dynamically passed
    }
  }

  loadProgress() {
    this.http.get<any>(`http://localhost:5000/api/progress/${this.courseId}`).subscribe({
      next: res => {
        this.percent = res.percent || 0;
      },
      error: err => console.error('Progress fetch failed', err)
    });
  }
}
