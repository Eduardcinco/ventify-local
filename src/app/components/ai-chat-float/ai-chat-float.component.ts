/**
 * 🤖 COMPONENTE DE CHAT FLOTANTE CON IA
 * Botón morado inferior derecha que despliega un panel de chat
 * con inteligencia artificial para ayuda sobre Ventify
 */
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService, AiChatMessage } from '../../services/ai.service';

@Component({
  selector: 'app-ai-chat-float',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat-float.component.html',
  styleUrls: ['./ai-chat-float.component.css']
})
export class AiChatFloatComponent {
  // Estado del panel
  isOpen = signal(false);
  
  // Chat
  messages = signal<AiChatMessage[]>([]);
  currentQuestion = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private aiService: AiService) {}

  toggleChat(): void {
    this.isOpen.set(!this.isOpen());
    if (this.isOpen() && this.messages().length === 0) {
      // Mensaje de bienvenida
      this.messages.set([{
        role: 'assistant',
        content: '¡Hola! 👋 Soy tu asistente de Ventify. ¿En qué puedo ayudarte hoy? Puedo responder sobre:\n\n• Punto de venta y ventas\n• Inventario y productos\n• Reportes y estadísticas\n• Mermas y ajustes\n• Configuración del sistema'
      }]);
    }
  }

  enviarPregunta(): void {
    const question = this.currentQuestion().trim();
    if (!question || this.loading()) return;

    // Agregar pregunta del usuario
    const newMessages = [
      ...this.messages(),
      { role: 'user' as const, content: question }
    ];
    this.messages.set(newMessages);
    this.currentQuestion.set('');
    this.loading.set(true);
    this.error.set(null);

    // Enviar a la IA
    this.aiService.chat(newMessages).subscribe({
      next: (response) => {
        this.messages.set([
          ...this.messages(),
          { role: 'assistant', content: response.message }
        ]);
        this.loading.set(false);
        
        // Auto-scroll al final
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('Error en chat IA:', err);
        this.error.set('No pude procesar tu pregunta. Intenta de nuevo.');
        this.loading.set(false);
      }
    });
  }

  limpiarChat(): void {
    this.messages.set([{
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente de Ventify. ¿En qué puedo ayudarte hoy?'
    }]);
    this.currentQuestion.set('');
    this.error.set(null);
  }

  private scrollToBottom(): void {
    const chatBody = document.querySelector('.ai-chat-messages');
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarPregunta();
    }
  }
}
