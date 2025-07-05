import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProgressToggleComponent } from "../../progress/progress-toggle.component";
import { ProgressBarComponent } from "../../progress/progress-bar/progress-bar.component";
import { AuthService } from '../../auth/auth.service'; // assume user is stored here
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ProgressToggleComponent, ProgressBarComponent],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit {
  courseId = '';
  course: any;
  structure: any[] = [];
  enrolled = false;
  loading = true;
  mat: any;
  courseProgress: number | null = null;
  certificateEligible = false;
  showMessage = false;
  @Output() progressUpdated = new EventEmitter<number>();

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.courseId = this.route.snapshot.params['id'];

    this.http.get(`http://localhost:5000/api/courses/${this.courseId}`).subscribe({
      next: (data: any) => {
        this.course = data;
        const userId = this.auth.getUser()?._id;
        this.enrolled = data.enrolledStudents?.includes(userId);
        this.checkStructure();
        if (this.enrolled) {
          this.loadProgress(); // now calls checkEligibility() inside it
        }
      },
      error: err => console.error(err)
    });
  }

  loadProgress() {
    this.http.get<any>(`http://localhost:5000/api/progress/${this.courseId}`).subscribe({
      next: progressRes => {
        this.courseProgress = progressRes.completionPercentage;
        const completedIds = progressRes.completedMaterials.map((m: any) => m._id);
        this.structure = this.structure.map(sec => ({
          ...sec,
          isCompleted: sec.materials.length > 0 && sec.materials.every((m: any) => completedIds.includes(m._id)),
          materials: sec.materials.map((mat: any) => ({
            ...mat,
            isCompleted: completedIds.includes(mat._id)
          }))
        }));
        
        // ✅ Re-check eligibility after progress is loaded
        this.checkEligibility();
      },
      error: err => console.error('Error loading progress', err)
    });
  }
  

  checkStructure() {
    this.http.get<any[]>(`http://localhost:5000/api/courses/${this.courseId}/structure`).subscribe({
      next: data => {
        if (this.enrolled) {
          // Fetch progress and enhance structure
          this.http.get<any>(`http://localhost:5000/api/progress/${this.courseId}`).subscribe({
            next: progressRes => {
              const completedIds = progressRes.completedMaterials.map((m: any) => m._id);
              this.structure = data.map(sec => ({
                ...sec,
                isCompleted: sec.materials.length > 0 && sec.materials.every((m: any) => completedIds.includes(m._id)),
                materials: sec.materials.map((mat: any) => ({
                  ...mat,
                  isCompleted: completedIds.includes(mat._id)
                }))
              }));
              this.loading = false;
            },
            error: () => {
              this.structure = data; // fallback
              this.loading = false;
            }
          });
        } else {
          this.structure = data;
          this.loading = false;
        }
      },
      error: err => {
        if (err.status === 403) this.enrolled = false;
        this.loading = false;
      }
    });
  }


  enroll() {
    this.http.post(`http://localhost:5000/api/courses/${this.courseId}/enroll`, {}).subscribe({
      next: () => {
        this.enrolled = true;
        this.checkStructure();
        this.loadProgress(); // Load progress after enrolling
        alert('Enrolled successfully');
        this.router.navigate(['/my-courses']);
      },
      error: err => alert(err.error.message || 'Enrollment failed')
    });
  }

  checkEligibility() {
    this.http.get<{ eligible: boolean }>(`http://localhost:5000/api/certificates/${this.courseId}/eligibility`)
      .subscribe({
        next: res => {
          console.log("Eligibility response:", res); // ADD THIS
          this.certificateEligible = res.eligible;
          console.log("true");
        },
        error: err => console.error('Eligibility check failed', err)
      });
  }

  downloadMaterial(matId: string, filename: string, type: string) {
    const token = localStorage.getItem('token');
    const downloadUrl = `http://localhost:5000/api/materials/${matId}/download`;
  
    this.http.get(downloadUrl, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe(blob => {
      // If filename is empty or undefined, use matId as default with .mp4 extension
      if (!filename) {
        console.error('Filename is not provided');
        filename = `file_${matId}.mp4`;  // Default name with .mp4 extension
      }
  
      // Always append .mp4 extension if it's a video
      if (type === 'video' && !filename.endsWith('.mp4')) {
        filename += '.mp4';  // Ensure filename ends with .mp4
      }
  
      // Create a download URL for the blob data
      const url = window.URL.createObjectURL(blob);
  
      // Create an anchor element to trigger the download
      const a = document.createElement('a');
      a.href = url;
  
      // Set the filename for the download
      a.download = filename;
  
      // Programmatically trigger the download
      a.click();
  
      // Revoke the object URL to clean up
      window.URL.revokeObjectURL(url);
    }, error => {
      console.error('Download failed', error);
    });
  }
  

checkCourseCompletionAndDownload() {
  // Fetch eligibility fresh when user clicks
  this.http.get<{ eligible: boolean }>(`http://localhost:5000/api/certificates/${this.courseId}/eligibility`)
    .subscribe({
      next: res => {
        if (res.eligible) {
          this.downloadCertificate(); // your actual download logic
        } else {
          this.showMessage = true; // show the modal
        }
      },
      error: err => {
        console.error('Eligibility check failed', err);
        this.showMessage = true;
      }
    });
}


  downloadCertificate() {
    const token = localStorage.getItem('token');

    this.http.get<{ eligible: boolean }>(`http://localhost:5000/api/certificates/${this.courseId}/eligibility`)
      .pipe(
        switchMap(res => {
          if (res.eligible) {
            return this.http.get(`http://localhost:5000/api/certificates/${this.courseId}/download`, {
              responseType: 'blob',
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
          } else {
            throw new Error('User is not eligible for certificate download.');
          }
        })
      )
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${this.course?.title || 'certificate'}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Certificate download failed or not eligible', err);
        }
      });
  }

  closeMessage(): void {
    this.showMessage = false;
  }

  onProgressUpdated(newPercent: number) {
    this.courseProgress = newPercent;
    this.checkEligibility(); // Re-check certificate eligibility
  }
}