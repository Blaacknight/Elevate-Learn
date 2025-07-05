import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterViewChecked,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-chatroom',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.css']
})
export class ChatroomComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild('messageList', { static: true }) messageList!: ElementRef<HTMLElement>;
  messages: { user: string; text: string; imageUrl?: string | null }[] = [];
  messageText = '';
  currentUser = '';
  socket!: Socket;
  selectedImage: File | null = null;
  selectedImagePreview: string | ArrayBuffer | null = null;
  enlargedImage: string | null = null;

  private scrollPending = false;

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    this.currentUser = user ? JSON.parse(user).name : 'Guest';

    this.loadMessages();
    this.connectSocket();
  }

  ngAfterViewInit(): void {
    this.scrollPending = true;
  }

  ngAfterViewChecked(): void {
    if (this.scrollPending) {
      this.scrollToBottom();
      this.scrollPending = false;
    }
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  loadMessages(): void {
    this.http
      .get<{ user: string; text: string; imageUrl?: string }[]>('http://localhost:5000/api/chat')
      .subscribe({
        next: (data) => {
          this.messages = data.map((message) => ({
            ...message,
            imageUrl: message.imageUrl ? 'http://localhost:5000' + message.imageUrl : null
          }));
          this.scrollPending = true;
        },
        error: (err) => console.error('Error loading messages', err)
      });
  }

  connectSocket(): void {
    this.socket = io('http://localhost:5000');

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    this.socket.on('message', (msg: { user: string; text: string; imageUrl?: string }) => {
      const exists = this.messages.some(
        (m) => m.text === msg.text && m.user === msg.user
      );
      if (!exists) {
        this.messages.push({
          ...msg,
          imageUrl: msg.imageUrl ? 'http://localhost:5000' + msg.imageUrl : null
        });
        this.scrollPending = true;
      }
    });
  }

  sendMessage(): void {
    if (this.messageText.trim() || this.selectedImage) {
      const formData = new FormData();
      formData.append('user', this.currentUser);
      formData.append('text', this.messageText);

      if (this.selectedImage) {
        formData.append('image', this.selectedImage);
      }

      const previewMsg = {
        user: this.currentUser,
        text: this.messageText,
        imageUrl: this.selectedImage ? 'uploading...' : null
      };

      this.messages.push(previewMsg);
      this.scrollPending = true;

      this.http.post<any>('http://localhost:5000/api/chat', formData).subscribe({
        next: (res) => {
          const index = this.messages.findIndex(
            (m) => m.text === previewMsg.text && m.user === previewMsg.user
          );
          if (index !== -1) {
            this.messages[index] = {
              ...res,
              imageUrl: res.imageUrl ? 'http://localhost:5000' + res.imageUrl : null
            };
          }

          this.socket.emit('message', res);
          this.scrollPending = true;
        },
        error: (err) => {
          console.error('Failed to send message', err);
          alert('Failed to send message. Please try again.');
        }
      });

      this.messageText = '';
      this.selectedImage = null;
      this.selectedImagePreview = null;
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  enlargeImage(imageUrl: string): void {
    this.enlargedImage = imageUrl;
  }

  closeEnlargedImage(): void {
    this.enlargedImage = null;
  }

  private scrollToBottom(): void {
    this.cd.detectChanges();
    const el = this.messageList.nativeElement;
    el.scrollTop = el.scrollHeight;
  }
}
