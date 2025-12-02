import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';
import { AiChatFloatComponent } from './components/ai-chat-float/ai-chat-float.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule, ToastComponent, AiChatFloatComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('FRONT');
}
