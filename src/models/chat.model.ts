/**
 * Chat and LÉO Companion Models
 */

export interface ChatMessage {
  id: string;
  sender: 'leo' | 'user' | 'system';
  text: string;
  timestamp: string;
  category?: 'biomechanics' | 'workout_adjustment' | 'motivation' | 'instructor_referral' | 'rest';
  actionButton?: {
    label: string;
    actionType: 'navigate_workout' | 'call_instructor' | 'adjust_weight' | 'swap_exercise';
    payload?: string;
  };
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  contextWorkout?: string;
  messages: ChatMessage[];
}

export interface SuggestedPrompt {
  id: string;
  text: string;
  icon?: string;
  category: string;
}
