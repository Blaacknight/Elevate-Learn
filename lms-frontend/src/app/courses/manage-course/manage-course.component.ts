import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-course',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './manage-course.component.html',
  styleUrls: ['./manage-course.component.css']
})
export class ManageCourseComponent implements OnInit {
  courseId = '';
  course: any;
  sections: any[] = [];

  // Section
  newSectionTitle = '';

  // Material
  materialInputs: { [sectionId: string]: any } = {};


  constructor(private route: ActivatedRoute, private http: HttpClient, public router: Router) {}

  editMaterial(mat: any) {
    const sectionId = mat.section;
    this.materialInputs[sectionId] = {
      title: mat.title,
      type: mat.type,
      url: mat.content,
      file: null,
      editingId: mat._id
    };
  }
  

  ngOnInit(): void {
    this.courseId = this.route.snapshot.params['id'];
    this.loadCourse();
    this.loadSections();
  }

  // 🧠 Load course info
  loadCourse() {
    this.http.get<any>(`http://localhost:5000/api/courses/${this.courseId}`).subscribe(res => {
      this.course = res;
    });
  }

  // 🧠 Load sections with populated materials
 loadSections() {
  this.http.get<any[]>(`http://localhost:5000/api/sections/course/${this.courseId}`)
    .subscribe({
      next: res => {
        this.sections = res;
      },
      error: err => {
        console.error('Failed to load sections:', err);
      }
    });
}


  // ✅ Toggle publish/unpublish
  togglePublish(courseId: string) {
    this.http.patch(`http://localhost:5000/api/courses/${courseId}/toggle-publish`, {})
      .subscribe(() => {
        this.loadCourse(); // Refresh course info
      });
  }
  

  // ✅ Delete course
  deleteCourse(courseId: string) {
    if (confirm('Are you sure you want to delete this course?')) {
      this.http.delete(`http://localhost:5000/api/courses/${courseId}`).subscribe(() => {
        this.router.navigate(['/tutor-dashboard']);
      });
    }
  }

  // ✅ Add section
  addSection() {
    if (!this.newSectionTitle) return;
    this.http.post(`http://localhost:5000/api/sections`, {
      courseId: this.courseId,
      title: this.newSectionTitle
    }).subscribe(() => {
      this.newSectionTitle = '';
      this.loadSections();
    });
  }

  // ✅ Delete section
  deleteSection(sectionId: string) {
    if (confirm('Delete this section?')) {
      this.http.delete(`http://localhost:5000/api/sections/${sectionId}`).subscribe(() => {
        this.loadSections();
      });
    }
  }

  // ✅ Handle file upload
  onFileChange(event: any, sectionId: string) {
    this.materialInputs[sectionId].file = event.target.files[0];
  }
  
  // ✅ Upload material
  uploadMaterial(sectionId: string) {
    const input = this.materialInputs[sectionId];
    if (!input?.title) return;
  
    const formData = new FormData();
    formData.append('title', input.title);
    formData.append('type', input.type);
    formData.append('sectionId', sectionId);
    formData.append('courseId', this.courseId);
  
    if (input.type === 'youtube' || input.type === 'text') {
      formData.append('content', input.url);
    } else if (input.file) {
      formData.append('file', input.file);
    }
  
    if (input.editingId) {
      this.http.put(`http://localhost:5000/api/materials/${input.editingId}`, formData).subscribe(() => {
        this.materialInputs[sectionId] = { title: '', type: 'pdf', url: '', file: null };
        this.loadSections();
      });
    } else {
      this.http.post('http://localhost:5000/api/materials', formData).subscribe(() => {
        this.materialInputs[sectionId] = { title: '', type: 'pdf', url: '', file: null };
        this.loadSections();
      });
    }
  }
  
  

  // ✅ Delete material
  deleteMaterial(materialId: string) {
    if (confirm('Delete this material?')) {
      this.http.delete(`http://localhost:5000/api/materials/${materialId}`).subscribe(() => {
        this.loadSections();
      });
    }
  }

  downloadMaterial(matId: string, filename: string) {
    const token = localStorage.getItem('token');
    this.http.get(`http://localhost:5000/api/materials/${matId}/download`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    }, error => {
      console.error('Download failed', error);
    });
  }
  

  // Optional: route to edit course
  editCourse() {
    this.router.navigate([`/edit-course/${this.courseId}`]);
  }
}
