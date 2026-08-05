export interface NotificationContext {
  recipient: string
  subject?: string
  content: string
}

export interface NotificationProvider {
  send(context: NotificationContext): Promise<{ success: boolean; error?: string }>
}

// ============================================
// PROVIDERS (Mocks pour l'extensibilité future)
// ============================================

export class MockWhatsAppProvider implements NotificationProvider {
  async send(context: NotificationContext) {
    // ICI: Implémentation Meta API ou Twilio
    console.log(`[WhatsApp Mock] Envoi à ${context.recipient}: ${context.content}`)
    return { success: true }
  }
}

export class MockEmailProvider implements NotificationProvider {
  async send(context: NotificationContext) {
    // ICI: Implémentation Resend ou Nodemailer
    console.log(`[Email Mock] Envoi à ${context.recipient} | Sujet: ${context.subject}`)
    return { success: true }
  }
}

export class MockSMSProvider implements NotificationProvider {
  async send(context: NotificationContext) {
    // ICI: Implémentation fournisseur SMS local (ex: Orange, Wave)
    console.log(`[SMS Mock] Envoi à ${context.recipient}: ${context.content}`)
    return { success: true }
  }
}

// ============================================
// ORCHESTRATEUR
// ============================================

export class NotificationOrchestrator {
  private providers: Record<string, NotificationProvider>

  constructor() {
    // Injection des dépendances. 
    // Facile à remplacer par de vrais providers en production selon les clés d'API dispo.
    this.providers = {
      whatsapp: new MockWhatsAppProvider(),
      email: new MockEmailProvider(),
      sms: new MockSMSProvider(),
    }
  }

  async notify(channel: 'whatsapp' | 'email' | 'sms', context: NotificationContext) {
    const provider = this.providers[channel]
    if (!provider) {
      return { success: false, error: `Canal ${channel} non supporté` }
    }
    
    try {
      return await provider.send(context)
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  }
}

export const notificationService = new NotificationOrchestrator()
