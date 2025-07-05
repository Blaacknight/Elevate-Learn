import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-live-coding',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './live-coding.component.html',
  styleUrls: ['./live-coding.component.css']
})
export class LiveCodingComponent {
  languages = [
    { id: '71', name: 'Python (3)' },
    { id: '62', name: 'Java' },
    { id: '63', name: 'JavaScript (Node.js)' },
    { id: '54', name: 'C++' },
    { id: '50', name: 'C' },
    { id: '78', name: 'Kotlin' },
    { id: '74', name: 'TypeScript' },
    { id: '70', name: 'Python 2' },
    { id: '72', name: 'Ruby' },
    { id: '79', name: 'Rust' },
    { id: '80', name: 'Scala' },
    { id: '83', name: 'Swift' },
    { id: '81', name: 'Perl' },
    { id: '68', name: 'PHP' },
    { id: '84', name: 'VB.NET' },
    { id: '86', name: 'F#' },
    { id: '51', name: 'Pascal' },
    { id: '85', name: 'Objective-C' }
  ];

  languageId = '62'; // Default Java
  code = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`; // Default Java code
  input = '';
  output = '';
  loading = false;

  constructor(private http: HttpClient, private router: Router) {}

  runCode() {
    if (!this.code.trim()) {
      this.output = 'Code editor is empty.';
      return;
    }

    this.loading = true;
    this.output = '';

    const body = {
      language_id: this.languageId,
      source_code: this.code,
      stdin: this.input
    };

    this.http.post<any>('http://localhost:5000/api/code/run', body).subscribe({
      next: (res) => {
        this.loading = false;
        const result = res.result;
        this.output =
          result?.stdout?.trim() ||
          result?.stderr?.trim() ||
          result?.compile_output?.trim() ||
          'No output received.';
      },
      error: (err) => {
        this.loading = false;
        this.output = 'Error: ' + (err.error?.error || 'Unable to execute code');
      }
    });
  }

  goBack() {
    window.location.reload(); // Navigate to the home page or previous route
  }

  refresh() {
    this.code = '';
    this.input = '';
    this.output = '';
    this.loading = false; // Reload the page
  }
}
